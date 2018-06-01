// @flow

// Implemented based on the following spec:
// https://facebook.github.io/relay/graphql/connections.htm

import type { PaginationInput, SORT_TYPE, PageInfo } from "graphql-types";

async function getVerticesByPropsPaginated({
  db,
  collection,
  props,
  pagination,
}: {
  db: Object,
  collection: string,
  props: Object,
  pagination: PaginationInput,
}): Promise<Object> {
  var query = `FOR doc in ${collection}`;
  const { filter, bindVars } = createFilterFromExample({ props, query });
  const collections = [collection];
  return getPaginatedDocuments({
    db,
    filter,
    bindVars,
    pagination,
    collections,
  });
}

async function getEdgesByPropsPaginated({
  db,
  vertexCollection,
  edgeCollection,
  direction,
  startVertex,
  props,
  pagination,
}: {
  db: Object,
  vertexCollection: string,
  edgeCollection: string,
  direction: string,
  startVertex: Object,
  props: Object,
  pagination: PaginationInput,
}): Promise<Object> {
  var query = `
    FOR doc IN ${direction} '${startVertex._id}' ${edgeCollection}
  `;
  const { filter, bindVars } = createFilterFromExample({ props, query });
  const collections = [vertexCollection, edgeCollection];
  return getPaginatedDocuments({
    db,
    filter,
    bindVars,
    pagination,
    collections,
  });
}

function createFilterFromExample({
  props,
  query,
}: {
  props: Object,
  query: string,
}): Object {
  var parts = [];
  var bindVars = {};
  var keys = Object.keys(props);

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    const val = props[key];
    const att = `att${i}`;
    const value = `value${i}`;

    parts.push(`doc.@${att} == @${value}`);
    bindVars[att] = key;
    bindVars[value] = val;
  }

  if (parts.length > 0) {
    query += ` FILTER ${parts.join(" AND ")}`;
  }
  query += " RETURN doc";
  return {
    filter: query,
    bindVars,
  };
}

async function getPaginatedDocuments({
  db,
  filter,
  bindVars,
  pagination,
  collections,
}: {
  db: Object,
  filter: string,
  bindVars: Object,
  pagination: PaginationInput,
  collections: Array<string>,
}): Promise<Object> {
  let { before, after, first, last, orderBy, sortType } = pagination;

  const { filterBefore, filterAfter } = getBeforeAfterFilters({
    before,
    after,
    sortType,
    bindVars,
  });

  const query = createQuery({
    filter,
    filterBefore,
    filterAfter,
    bindVars,
    collections,
    sortType,
    orderBy,
  });

  const { page, totalCount } = await getPage({
    db,
    query,
    bindVars,
  });

  const pageInfo: PageInfo = {
    hasNextPage: Boolean(first && page.length > first),
    hasPreviousPage: Boolean(last && page.length > last),
  };
  const slicedPage = slicePage({ page, first, last });
  const edges = slicedPage.map(node => {
    return {
      node,
      cursor: createCursor(node.id, node[orderBy]),
    };
  });
  if (edges.length) {
    pageInfo.startCursor = edges[0].cursor;
    pageInfo.endCursor = edges[edges.length - 1].cursor;
  }
  return {
    edges,
    pageInfo,
    totalCount,
  };
}

function createQuery({
  filter,
  filterBefore,
  filterAfter,
  sortType,
  orderBy,
  bindVars,
  collections,
  maxPageSize = 100,
}: {
  filter: string,
  filterBefore: string,
  filterAfter: string,
  sortType?: SORT_TYPE,
  orderBy?: string,
  bindVars: Object,
  collections: Array<string>,
  maxPageSize?: number,
}) {
  const order = sortType === "ASCENDING" ? "ASC" : "DESC";
  const query = `
    WITH ${collections.join(", ")}
    LET filtered = ( ${filter} )
    LET page = (
      FOR doc in filtered
        SORT doc.@orderBy @order
        ${filterBefore}
        ${filterAfter}
        LIMIT @maxPageSize
        RETURN doc
    )
    RETURN {
      "page": page,
      "totalCount": LENGTH(filtered)
    }
  `;
  bindVars.maxPageSize = maxPageSize;
  bindVars.orderBy = orderBy;
  bindVars.order = order;
  return query;
}

function getBeforeAfterFilters({
  before,
  after,
  sortType,
  bindVars,
}: {
  before?: string,
  after?: string,
  sortType?: SORT_TYPE,
  bindVars: Object,
}): Object {
  let filterBefore = "";
  let filterAfter = "";
  if (before) {
    const beforeOp = sortType === "ASCENDING" ? "<" : ">";
    filterBefore = `
      FILTER doc.@orderBy ${beforeOp} @startSort
        OR (doc.@orderBy == @startSort AND doc.id ${beforeOp} @startId)
    `;
    const [startId, startSort] = readCursor(before);
    bindVars.startId = startId;
    bindVars.startSort = startSort;
  }
  if (after) {
    const afterOp = sortType === "ASCENDING" ? ">" : "<";
    filterAfter = `
      FILTER doc.@orderBy ${afterOp} @afterSort
        OR (doc.@orderBy == @afterSort AND doc.id ${afterOp} @afterId)
    `;
    const [afterId, afterSort] = readCursor(after);
    bindVars.afterId = afterId;
    bindVars.afterSort = afterSort;
  }
  return {
    filterBefore,
    filterAfter,
  };
}

async function getPage({
  db,
  query,
  bindVars,
}: {
  db: Object,
  query: string,
  bindVars: Object,
}): Promise<Object> {
  const cursor = await db.query({
    query,
    bindVars,
  });
  const [result] = await cursor.all();
  const { page, totalCount } = result;
  return {
    page,
    totalCount,
  };
}

function createCursor(id: string, orderBy: string): string {
  return `${id}_${orderBy}`;
}

function readCursor(cursor: string): Array<string> {
  return cursor.split("_");
}

function slicePage({
  page,
  first,
  last,
}: {
  page: Array<Object>,
  first?: number,
  last?: number,
}): Array<Object> {
  if (first) {
    if (first < 0) {
      throw new Error("Parameter 'first' cannot be negative");
    }
    if (page.length > first) {
      page = page.slice(0, first);
    }
  }
  if (last) {
    if (last < 0) {
      throw new Error("Parameter 'last' cannot be negative");
    }
    if (page.length > last) {
      page = page.slice(page.length - last, page.length);
    }
  }
  return page;
}

export { getVerticesByPropsPaginated, getEdgesByPropsPaginated };
