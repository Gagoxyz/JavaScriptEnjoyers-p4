const { buildSchema } = require('graphql')

const schema = buildSchema(`
  type User {
    _id: ID
    name: String
    email: String
    password: String
    role: String
  }

  type Card {
    _id: ID
    date: String
    title: String
    description: String
    autor: String
    volunType: String
    email: String
  }

  type UserCards {
    email: String!
    selectedCards: [Card]!
  }

  type AuthPayload {
    message: String!
    token: String!
  }

  input UserInput {
    name: String
    email: String
    password: String
  }

  input UserCreate {
    name: String!
    email: String!
    password: String!
    role: String
  }

  input CardInput {
    date: String
    title: String
    description: String
    autor: String
    volunType: String
    email: String
  }

  input CardCreate {
    date: String!
    title: String!
    description: String!
    autor: String!
    volunType: String!
    email: String!
  }

  type Query {
    getUsers: [User]
    getCards: [Card]
    userByEmail(email: String!): User
    currentUser: User
    getUserCards: [Card]!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload
    createUser(input: UserCreate!): String
    updateUser(input: UserInput!): String
    deleteUser(email: String!): String

    createCard(input: CardCreate!): Card
    updateCard(cardId: String!, input: CardInput!): String
    deleteCard(cardId: String!): String

    addUserCard(cardId: String!): String
    deleteUserCard(cardId: String!): String
  }
`)

module.exports = schema
