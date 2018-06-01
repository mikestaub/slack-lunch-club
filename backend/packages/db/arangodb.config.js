// WARNING - changing this file will mutate the structure of the database.

const edges = {
  MATCHED: "matched",
  MEMBER: "member",
};

const vertices = {
  USERS: "users",
  SLACK_TEAMS: "slack_teams",
};

const topology = {
  edges,
  vertices,
  edgeDefinitions: [
    {
      collection: edges.MATCHED,
      from: [vertices.USERS],
      to: [vertices.USERS],
    },
    {
      collection: edges.MEMBER,
      from: [vertices.USERS],
      to: [vertices.SLACK_TEAMS],
    },
  ],
};

// All vertices should at least have a hash index on the 'id' property
// skiplists are used for pagination
// https://docs.arangodb.com/3.3/Manual/Indexing/IndexBasics.html
const indices = {
  [vertices.SLACK_TEAMS]: [
    {
      type: "hash",
      unique: true,
      fields: ["id"],
    },
  ],
  [vertices.USERS]: [
    {
      type: "hash",
      unique: true,
      fields: ["id"],
    },
    {
      type: "hash",
      unique: true,
      fields: ["email"],
    },
    {
      type: "geo2",
      unique: false,
      fields: ["location.lat", "location.lng"],
    },
    {
      fields: ["id"],
      sparse: false,
      type: "skiplist",
      unique: true,
    },
  ],
  [edges.MATCHED]: [
    {
      type: "hash",
      unique: true,
      fields: ["id"],
    },
  ],
  [edges.MEMBER]: [
    {
      type: "hash",
      unique: true,
      fields: ["id"],
    },
  ],
};

const graphName = "slack_lunch_club";

const structure = {
  topology,
  indices,
  graphName,
};

export default structure;

export { indices, topology, graphName };
