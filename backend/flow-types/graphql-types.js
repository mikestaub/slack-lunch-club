/* @flow */

declare module "graphql-types" {
declare type GraphQLResponseRoot = {
  data?: Query | Mutation;
  errors?: Array<GraphQLResponseError>;
}

declare type GraphQLResponseError = {
  message: string;            // Required for all errors
  locations?: Array<GraphQLResponseErrorLocation>;
  [propName: string]: any;    // 7.2.2 says 'GraphQL servers may provide additional entries to error'
}

declare type GraphQLResponseErrorLocation = {
  line: number;
  column: number;
}

declare type Query = {
  getCurrentUser?: ?GetCurrentUserResult;
  getUsersRequestingMatch?: ?GetUsersRequestingMatchResult;
  getUsersByProps?: ?GetUsersByPropsResult;
  getSlackTeamsByProps?: ?GetSlackTeamsByPropsResult;
}

declare type GetCurrentUserResult = {
  user: User;
}

declare type User = {
  id: string;
  name: string;
  email: any;
  profilePhoto: any;
  role?: ?USER_ROLE;
  matchEveryWeek?: ?boolean;
  availableDays?: ?UserAvailableDays;
  location?: ?GeoLocation;
  lastMatchEmailSent?: ?any;
  matchedConnection?: ?UserMatchedConnection;
  slackTeamMemberConnection?: ?SlackTeamMemberConnection;
  createdAt: any;
}

declare type Node = User | SlackTeam;

declare type USER_ROLE = "DEFAULT" | "ADMIN";

declare type UserAvailableDays = {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
}

declare type GeoLocation = {
  formattedAddress?: ?string;
  key?: ?string;
  lat: number;
  lng: number;
}

declare type MatchedConnectionInput = {
  filter?: UserInput;
  pagination?: PaginationInput;
}

declare type UserInput = {
  id?: string;
  name?: string;
  email?: any;
  profilePhoto?: any;
  role?: USER_ROLE;
  matchEveryWeek?: boolean;
  availableDays?: UserAvailableDaysInput;
  location?: PhysicalLocationInput;
  lastMatchEmailSent?: any;
  createdAt?: any;
}

declare type UserAvailableDaysInput = {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
}

declare type PhysicalLocationInput = {
  formattedAddress?: string;
  key?: string;
  lat: number;
  lng: number;
}

declare type PaginationInput = {
  before?: any;
  after?: any;
  first?: any;
  last?: any;
  orderBy?: string;
  sortType?: SORT_TYPE;
}

declare type SORT_TYPE = "ASCENDING" | "DESCENDING";

declare type UserMatchedConnection = {
  totalCount: number;
  pageInfo: PageInfo;
  edges: Array<UsersEdge>;
}

declare type Connection = UserMatchedConnection | SlackTeamMemberConnection | UserMemberConnection | GetUsersByPropsResult | GetSlackTeamsByPropsResult;

declare type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: ?any;
  endCursor?: ?any;
}

declare type UsersEdge = {
  cursor: any;
  node: User;
  createdAt?: ?any;
}

declare type Edge = UsersEdge | SlackTeamsEdge;

declare type SlackTeamMemberConnectionInput = {
  filter?: SlackTeamInput;
  pagination?: PaginationInput;
}

declare type SlackTeamInput = {
  id?: string;
  slackApiId?: string;
  name?: string;
}

declare type SlackTeamMemberConnection = {
  totalCount: number;
  pageInfo: PageInfo;
  edges: Array<SlackTeamsEdge>;
}

declare type SlackTeamsEdge = {
  cursor: any;
  node: SlackTeam;
  createdAt?: ?any;
}

declare type SlackTeam = {
  id: string;
  slackApiId: string;
  name: string;
  createdAt: any;
  userMemberConnection?: ?UserMemberConnection;
}

declare type UserMemberConnectionInput = {
  filter?: UserInput;
  pagination?: PaginationInput;
}

declare type UserMemberConnection = {
  totalCount: number;
  pageInfo: PageInfo;
  edges: Array<UsersEdge>;
}

declare type GetUsersRequestingMatchResult = {
  possibleMatchesForUsers: Array<PossibleMatchesForUser>;
}

declare type PossibleMatchesForUser = {
  userId: string;
  possibleMatches: Array<string>;
}

declare type GetUsersByPropsInput = {
  filter?: UserInput;
  pagination?: PaginationInput;
}

declare type GetUsersByPropsResult = {
  totalCount: number;
  edges: Array<UsersEdge>;
  pageInfo: PageInfo;
}

declare type GetSlackTeamsByPropsInput = {
  filter?: SlackTeamInput;
  pagination?: PaginationInput;
}

declare type GetSlackTeamsByPropsResult = {
  totalCount: number;
  edges: Array<SlackTeamsEdge>;
  pageInfo: PageInfo;
}

declare type Mutation = {
  createUser?: ?CreateUserResult;
  updateUser?: ?UpdateUserResult;
  deleteUser?: ?DeleteUserResult;
  notifyUnmatchedUsers?: ?NotifyUnmatchedUsersResult;
  matchUsers?: ?MatchUsersResult;
  addToSlackTeam?: ?AddToSlackTeamResult;
  createSlackTeam?: ?CreateSlackTeamResult;
  updateSlackTeam?: ?UpdateSlackTeamResult;
  deleteSlackTeam?: ?DeleteSlackTeamResult;
}

declare type CreateUserInput = {
  name: string;
  email: any;
  profilePhoto: any;
  role?: USER_ROLE;
  matchEveryWeek?: boolean;
  availableDays?: UserAvailableDaysInput;
  location?: PhysicalLocationInput;
}

declare type CreateUserResult = {
  user: User;
}

declare type UpdateUserInput = {
  id: string;
  name?: string;
  email?: any;
  profilePhoto?: any;
  role?: USER_ROLE;
  matchEveryWeek?: boolean;
  availableDays?: UserAvailableDaysInput;
  location?: PhysicalLocationInput;
  lastMatchEmailSent?: any;
}

declare type UpdateUserResult = {
  user: User;
}

declare type DeleteUserInput = {
  id: string;
}

declare type DeleteUserResult = {
  success: boolean;
}

declare type NotifyUnmatchedUsersInput = {
  userIds: Array<string>;
}

declare type NotifyUnmatchedUsersResult = {
  success: boolean;
}

declare type MatchUsersInput = {
  matches: Array<Array<string>>;
}

declare type MatchUsersResult = {
  success: boolean;
}

declare type AddToSlackTeamInput = {
  slackTeamId: string;
  userId: string;
}

declare type AddToSlackTeamResult = {
  success: boolean;
}

declare type CreateSlackTeamInput = {
  slackApiId: string;
  name: string;
}

declare type CreateSlackTeamResult = {
  slackTeam: SlackTeam;
}

declare type UpdateSlackTeamInput = {
  id: string;
  slackApiId?: string;
  name?: string;
}

declare type UpdateSlackTeamResult = {
  slackTeam: SlackTeam;
}

declare type DeleteSlackTeamInput = {
  id: string;
}

declare type DeleteSlackTeamResult = {
  success: boolean;
}
}