// @flow

import uuid from "uuid";

import ArangoDB from "./ArangoDB";
import graphConfig from "./arangodb.config";

// TODO this package should be tested and open sourced

export interface IGraphDatabase {
  graphConfig: IGraphDBConfig;
  initialize: () => Promise<any>;
  query: (params: Object) => Promise<any>;
  transaction: (params: Object) => Promise<any>;
  traversal: (params: Object) => Promise<any>;
  createDefaultDocumentProps: () => Object;
  getVertex: (collection: string, props: Object) => Promise<?Object>;
  getVertices: (
    collection: string,
    props: Object,
    limit?: number,
  ) => Promise<Array<Object>>;
  createVertex: (collection: string, props: Object) => Promise<Object>;
  updateVertex: (
    collection: string,
    vertexId: string,
    props: Object,
  ) => Promise<Object>;
  deleteVertex: (collection: string, vertexId: string) => Promise<any>;
  getEdge: (collection: string, props: Object) => Promise<?Object>;
  getEdges: (collection: string, props: Object) => Promise<Array<Object>>;
  createEdge: (args: {
    collection: string,
    props: Object,
    from: Vertex,
    to: Vertex,
    allowDuplicates?: boolean,
  }) => Promise<Object>;
  deleteEdge: (collection: string, edgeId: string) => Promise<any>;
  updateEdge: (
    collection: string,
    edgeId: string,
    props: Object,
  ) => Promise<Object>;
  edgeExists: (args: {
    collection: string,
    from: Object,
    to: Object,
    direction?: string,
    maxDepth?: number,
  }) => Promise<boolean>;
  followEdge: (args: {
    collection: string,
    from: Object,
    direction?: string,
    depth?: number,
  }) => Promise<Array<Object>>;
}

export interface IGraphDBConfig {
  graphName: string;
  topology: {
    vertices: Object,
    edges: Object,
    edgeDefinitions: Array<Object>,
  };
  indices: Object;
}

export interface IDBConnectionConfig {
  host: string;
  port: string | number;
  username: string;
  password: string;
  dbName: string;
}

type Vertex = {
  id: string,
  created: string,
};

type Edge = {
  id: string,
  created: string,
};

class ArangoDBGraph implements IGraphDatabase {
  graphConfig: IGraphDBConfig;
  driver: Object;

  constructor(connectionConfig: IDBConnectionConfig) {
    this.graphConfig = graphConfig;
    this.driver = new ArangoDB(connectionConfig, graphConfig);
  }

  // all documents in graph must have these props
  createDefaultDocumentProps = (): Vertex | Edge => ({
    id: uuid.v4().replace(/-/g, ""),
    created: new Date().toISOString(),
  });

  initialize = (...args) => this.driver.initialize(...args);
  query = (...args) => this.driver.query(...args);
  traversal = (...args) => this.driver.traversal(...args);
  transaction = (...args) => this.driver.transaction(...args);

  getVertex = async (collection: string, props: Object): Promise<?Vertex> => {
    this._validateProps(props);
    const cursor = await this.driver.conn
      .collection(collection)
      .byExample(props);
    return cursor.next();
  };

  getVertices = async (
    collection: string,
    props: Object,
    limit?: number = 100,
  ): Promise<Array<Vertex>> => {
    this._validateProps(props);
    const cursor = await this.driver.conn
      .collection(collection)
      .byExample(props, { limit });
    return cursor.all();
  };

  createVertex = async (collection: string, props: Object): Promise<Vertex> => {
    const defaultProps = this.createDefaultDocumentProps();
    const vertex = {
      ...defaultProps,
      ...props,
    };
    await this.driver.graph.vertexCollection(collection).save(vertex);
    return vertex;
  };

  updateVertex = async (
    collection: string,
    vertexId: string,
    props: Object,
  ): Promise<Vertex> => {
    const query = { id: vertexId };
    const vertex = await this.getVertex(collection, query);
    if (!vertex) {
      throw new Error(
        `No vertex found with id ${vertexId} in '${collection}' collection.`,
      );
    }
    await this.driver.conn.collection(collection).updateByExample(query, props);
    return {
      ...vertex,
      ...props,
    };
  };

  deleteVertex = async (collection: string, vertexId: string): Promise<any> => {
    const query = { id: vertexId };
    const vertex = await this.getVertex(collection, query);
    // TODO optimize
    if (!vertex) {
      throw new Error(
        `No vertex found with id ${vertexId} in '${collection}' collection.`,
      );
    }
    return this.driver.graph.vertexCollection(collection).remove(vertex);
  };

  getEdge = async (collection: string, props: Object): Promise<?Edge> => {
    this._validateProps(props);
    const cursor = await this.driver.conn
      .collection(collection)
      .byExample(props);
    return cursor.next();
  };

  getEdges = async (
    collection: string,
    props: Object,
    limit?: number = 100,
  ): Promise<Array<Edge>> => {
    this._validateProps(props);
    const cursor = await this.driver.conn
      .collection(collection)
      .byExample(props, { limit });
    return cursor.all();
  };

  createEdge = async ({
    collection,
    props = {},
    to,
    from,
    allowDuplicates,
  }: {
    collection: string,
    props: Object,
    to: Object,
    from: Object,
    allowDuplicates?: boolean,
  }): Promise<Edge> => {
    const { graph } = this.driver;
    const defaultProps = this.createDefaultDocumentProps();
    const edge = {
      ...defaultProps,
      ...props,
    };
    if (!allowDuplicates) {
      await this._enforceUniqueEdge({ collection, from, to });
    }
    await graph.edgeCollection(collection).save(edge, from, to);
    return edge;
  };

  updateEdge = async (
    collection: string,
    edgeId: string,
    props: Object,
  ): Promise<Edge> => {
    const query = { id: edgeId };
    const edge = await this.getEdge(collection, query);
    if (!edge) {
      throw new Error(
        `No edge found with id ${edgeId} in '${collection}' collection.`,
      );
    }
    await this.driver.conn.collection(collection).updateByExample(query, props);
    return {
      ...edge,
      ...props,
    };
  };

  deleteEdge = async (collection: string, edgeId: string): Promise<any> => {
    const query = { id: edgeId };
    // TODO optimize
    const edge = await this.getEdge(collection, query);
    if (!edge) {
      throw new Error(
        `No edge found with id ${edgeId} in '${collection}' collection.`,
      );
    }
    return this.driver.graph.edgeCollection(collection).remove(edge);
  };

  edgeExists = async ({
    collection,
    from,
    to,
    direction = "ANY",
    maxDepth = 1,
  }: {
    collection: string,
    from: Object,
    to: Object,
    direction?: string,
    maxDepth?: number,
  }): Promise<boolean> => {
    const options = {
      startVertex: from["_id"],
      edgeCollection: collection,
      direction,
      maxDepth,
      init: `result.vertices = [];`,
      visitor: `if (vertex._id === '${to["_id"]}') {
      result.vertices.push(vertex);
    }`,
    };
    const { vertices } = await this.traversal(options);
    return Boolean(vertices.length);
  };

  followEdge = async ({
    collection,
    from,
    direction = "ANY",
    depth = 1,
  }: {
    collection: string,
    from: Object,
    direction?: string,
    depth?: number,
  }): Promise<Array<Object>> => {
    const options = {
      startVertex: from["_id"],
      edgeCollection: collection,
      direction,
      minDepth: depth,
      init: `result.vertices = [];`,
      visitor: `if (vertex._id !== '${from["_id"]}') {
      result.vertices.push(vertex);
    }`,
    };
    const { vertices } = await this.traversal(options);
    return vertices;
  };

  _validateProps(props: Object) {
    for (const key in props) {
      if (props[key] === undefined) {
        throw new Error(`Cannot query with undefined field: ${key}`);
      }
    }
  }

  _enforceUniqueEdge = async ({
    collection,
    from,
    to,
  }: {
    collection: string,
    from: Object,
    to: Object,
  }): Promise<void> => {
    const exists = await this.edgeExists({ collection, from, to });
    if (exists) {
      throw new Error(
        `Edge '${collection}' from '${from._id}' to '${
          to._id
        }' already exists.`,
      );
    }
  };
}

export default ArangoDBGraph;
