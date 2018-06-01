// @flow

import { Database } from "arangojs";
import promiseEach from "p-each-series";

import { isSubset, computeChangeSet } from "./utils";

import type { IGraphDBConfig, IDBConnectionConfig } from "./index";

// This class wraps the arangodb js driver and makes it much easier
// to use the graph features by supplying a declarative config
// https://github.com/arangodb/arangojs/blob/master/docs/Drivers/JS/Reference/README.md
class ArangoDB {
  connectionConfig: IDBConnectionConfig;
  graphConfig: IGraphDBConfig;
  isInitialized: boolean;
  isInitializing: boolean;
  graph: Object;
  conn: Object;
  initialEdgeCollections: Array<string>;
  initialVertexCollections: Array<string>;
  initialGraphInfo: Object;

  // use a temporary database as a mutex to avoid race conditions
  static TMP_LOCK_DATABASE = "TMP_LOCK_DATABASE";
  static SYSTEM_DB = "_system";

  constructor(
    connectionConfig: IDBConnectionConfig,
    graphConfig: IGraphDBConfig,
  ) {
    this.connectionConfig = connectionConfig;
    this.graphConfig = graphConfig;
    this.isInitialized = false;
    this.isInitializing = false;
  }

  // this function must protect against race conditions
  // ( multiple lambdas invoked simultaneously )
  initialize = async (): Promise<void> => {
    if (this.isInitialized) {
      return;
    }
    if (this.isInitializing) {
      await this._waitForAccess();
    }
    this._connect();
    await this._createLock();
    await this._getOrCreateDatabase();
    await this._getOrCreateGraph();
    await this._getInitialGraphState();
    await this._updateGraph();
    await this._createOrUpdateIndices();
    await this._deleteLock();
  };

  query = async (...args: Array<any>): Promise<any> => this.conn.query(...args);

  transaction = async (...args: Array<any>): Promise<any> =>
    this.conn.transaction(...args);

  traversal = async ({
    startVertex,
    edgeCollection,
    ...rest
  }: {
    startVertex: Object,
    edgeCollection: string,
    rest: Array<any>,
  }) => {
    const col = this.graph.edgeCollection(edgeCollection);
    return col.traversal(startVertex, rest);
  };

  _waitForAccess = async (retries: number = 1): Promise<void> => {
    const INTERVAL = 1000; // one second
    const MAX_RETRIES = 30;

    const hasLock = await this._hasLockDB();
    if (!hasLock) {
      return;
    }

    return new Promise((resolve, reject) => {
      if (retries > MAX_RETRIES) {
        reject("Too many retries");
      }
      setTimeout(() => resolve(this._waitForAccess(retries + 1)), INTERVAL);
    });
  };

  _hasLockDB = async (): Promise<boolean> => {
    const lockDb = ArangoDB.TMP_LOCK_DATABASE;
    this.conn.useDatabase(ArangoDB.SYSTEM_DB);
    const databases = await this.conn.listDatabases();
    return databases.includes(lockDb);
  };

  _createLock = async (): Promise<void> => {
    try {
      await this._waitForAccess();
      const lockDb = ArangoDB.TMP_LOCK_DATABASE;
      await this.conn.createDatabase(lockDb);
      this.isInitializing = true;
    } catch (err) {
      return this.initialize();
    }
  };

  _deleteLock = async (): Promise<void> => {
    const { dbName } = this.connectionConfig;
    const lockDb = ArangoDB.TMP_LOCK_DATABASE;
    this.conn.useDatabase(ArangoDB.SYSTEM_DB);
    const databases = await this.conn.listDatabases();
    if (databases.includes(lockDb)) {
      await this.conn.dropDatabase(lockDb);
    }
    this.conn.useDatabase(dbName);
    this.isInitialized = true;
    this.isInitializing = false;
  };

  _connect() {
    const { host, port, username, password } = this.connectionConfig;
    if (!this.conn) {
      this.conn = new Database({ url: `http://${host}:${port}` });
    }
    if (process.env.NODE_ENV !== "development") {
      this.conn.useBasicAuth(username, password);
    }
  }

  _getInitialGraphState = async () => {
    this.initialEdgeCollections = await this.graph.listEdgeCollections();
    this.initialVertexCollections = await this.graph.listVertexCollections();
    this.initialGraphInfo = await this.graph.get();
  };

  _getOrCreateDatabase = async (): Promise<void> => {
    const { dbName } = this.connectionConfig;
    const databases = await this.conn.listDatabases();
    if (!databases.includes(dbName)) {
      await this.conn.createDatabase(dbName);
    }
    this.conn.useDatabase(dbName);
  };

  _getOrCreateGraph = async (): Promise<void> => {
    const { graphName } = this.graphConfig;
    const { edgeDefinitions } = this.graphConfig.topology;
    this.graph = this.conn.graph(graphName);
    const graphs = await this.conn.listGraphs();
    const graphNames = graphs.map(graph => graph["_key"]);
    if (!graphNames.includes(graphName)) {
      await this.graph.create({ edgeDefinitions });
    }
  };

  _updateGraph = async (): Promise<void> => {
    const current = this.initialGraphInfo.edgeDefinitions;
    const desired = this.graphConfig.topology.edgeDefinitions;

    await this._deleteEdgeDefinitions(current, desired);
    await this._createOrUpdateVertexCollections();
    await this._createOrUpdateEdgeCollections();
    await this._createOrUpdateEdgeDefinitions(current, desired);
  };

  _deleteEdgeDefinitions = async (
    current: Array<Object>,
    desired: Array<Object>,
  ): Promise<void> => {
    const remove = current.filter(c =>
      desired.every(d => d.collection !== c.collection),
    );
    await promiseEach(remove, def =>
      this.graph.removeEdgeDefinition(def.collection),
    );
  };

  _createOrUpdateEdgeDefinitions = async (
    current: Array<Object>,
    desired: Array<Object>,
  ): Promise<void> => {
    const add = desired.filter(d =>
      current.every(c => d.collection !== c.collection),
    );
    await promiseEach(add, def => this.graph.addEdgeDefinition(def));
    await promiseEach(desired, def =>
      this.graph.replaceEdgeDefinition(def.collection, def),
    );
  };

  _createOrUpdateVertexCollections = async (): Promise<void> => {
    const { vertices } = this.graphConfig.topology;
    const current = await this.graph.listVertexCollections();
    const desired: Array<any> = Object.values(vertices);
    const { add, remove } = computeChangeSet(current, desired);

    await this._createVertexCollections(add);
    await this._removeVertexCollections(remove);
  };

  _createVertexCollections = async (add: Array<string>): Promise<void> => {
    await promiseEach(add, async (col: string) => {
      await this.graph.vertexCollection(col).create();
      if (this._isOrphanCollection(col)) {
        await this.graph.addVertexCollection(col);
      }
    });
  };

  _removeVertexCollections = async (remove: Array<string>): Promise<void> => {
    const { orphanCollections } = await this.graph.get();

    await promiseEach(remove, async (col: string) => {
      if (orphanCollections.includes(col)) {
        await this.graph.removeVertexCollection(col);
      }
      await this.graph.vertexCollection(col).drop();
    });
  };

  _isOrphanCollection = (col: string): boolean => {
    const { edgeDefinitions } = this.graphConfig.topology;
    const graphVertexCollections = edgeDefinitions.reduce((acc, def) => {
      return acc.concat(def.to).concat(def.from);
    }, []);
    return !graphVertexCollections.includes(col);
  };

  _createOrUpdateEdgeCollections = async (): Promise<void> => {
    const { edges } = this.graphConfig.topology;
    const current = this.initialEdgeCollections;
    const desired: Array<any> = Object.values(edges);
    const { add, remove } = computeChangeSet(current, desired);

    await promiseEach(add, col => this.graph.edgeCollection(col).create());
    await promiseEach(remove, col => this.graph.edgeCollection(col).drop());
  };

  _createOrUpdateIndices = async () => {
    const vertexCollections = await this.graph.listVertexCollections();
    const edgeCollections = await this.graph.listEdgeCollections();
    const currentCollections = vertexCollections.concat(edgeCollections);
    await promiseEach(currentCollections, this._updateCollectionIndices);
  };

  _updateCollectionIndices = async (collection: string): Promise<void> => {
    const col = this.conn.collection(collection);
    const current = await col.indexes();
    const desired = this.graphConfig.indices[collection] || [];

    const isReserved = (index: Object) => {
      const reservedIndexFields = ["_key", "_from", "_to"];
      return index.fields.some(field => reservedIndexFields.includes(field));
    };

    const remove = current.filter(
      index => !isReserved(index) && desired.every(i => !isSubset(i, index)),
    );

    const add = desired.filter(
      index => !isReserved(index) && current.every(i => !isSubset(index, i)),
    );

    await promiseEach(remove, index => col.dropIndex(index));
    await promiseEach(add, index => col.createIndex(index));
  };
}

export default ArangoDB;
