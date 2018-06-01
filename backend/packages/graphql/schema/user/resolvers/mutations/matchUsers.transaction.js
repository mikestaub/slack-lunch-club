// This code will be executed inside ArangoDB engine
// https://docs.arangodb.com/3.3/Manual/Graphs/GeneralGraphs/Management.html
// https://github.com/arangodb/arangodb/tree/devel/js

// creating a MATCHED edge and updating the availability should be
// executed as an ACID transaction to avoid corrupt state
// https://docs.arangodb.com/3.3/Manual/Transactions/

function matchUsersTransaction(params) {
  const graph_module = require("@arangodb/general-graph");
  let { user1, user2, edge, graphName } = params;
  const graph = graph_module._graph(graphName);

  function resetAvailableDays(user) {
    if (user.matchEveryWeek) {
      return;
    }
    const params = {
      availableDays: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
      },
    };

    graph.users.update(user["_id"], params);
  }

  function createEdge(user1, user2, edge) {
    const id1 = user1["_id"];
    const id2 = user2["_id"];
    graph.matched.save(id1, id2, edge);
  }

  resetAvailableDays(user1);
  resetAvailableDays(user2);
  createEdge(user1, user2, edge);
}

module.exports = matchUsersTransaction;
