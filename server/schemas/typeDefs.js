const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type GridItem {
    _id: ID
    title: String
    body: [String]
    i: Int
  }

  type PlannerItem {
    _id: ID
    body: String
    scheduled: Int
    status: String
    collection: ID
  }

  type Layout {
    _id: ID
    i: String
    x: Int
    y: Int
    w: Int
    h: Int
    minW: Int
    maxW: Int
    minH: Int
    maxH: Int
    card: String
  }

  type Spread {
    _id: ID
    monday: String!
    plannerItems: [PlannerItem]!
    gridItems: [GridItem]!
    layout: [Layout]
    userId: ID!
  }

  type User {
    _id: ID
    username: String
    email: String
    password: String
    spreads: [Spread]
  }

  type Auth {
    token: ID
    user: User
  }

  type Query {
    user: User
    allUsers: [User]
    spread(date: String): Spread
    spreadById(_id: ID): Spread
    userSpreads: [Spread]
  }

  type Mutation {
    addSpread(date: String!): Spread
    updateSpread(_id: ID): Spread
    addGridItem(
      title: String!
      body: String
      i: Int!
      x: Int
      y: Int
      w: Int
      h: Int
      spreadId: ID!
    ): GridItem
    updateGridItem(_id: ID!, title: String, body: [String], i: Int): GridItem
    addPlannerItem(
      spreadId: ID!
      body: String
      scheduled: String
      status: String
      collection: ID
    ): PlannerItem
    updatePlannerItem(
      _id: ID
      body: String
      scheduled: String
      status: String
      collection: ID
    ): PlannerItem
    addUser(username: String!, email: String!, password: String!): Auth
    updateUser(username: String, email: String, password: String): User
    login(email: String!, password: String!): Auth
  }
`;

module.exports = typeDefs;
