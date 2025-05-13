const { buildSchema } = require('graphql'); // Importamos buildSchema para construir el esquema GraphQL

/**
 * Define el esquema GraphQL para los usuarios, tarjetas y relaciones entre ambos.
 *
 * @module schema
 */

const schema = buildSchema(`
  type User {
    _id: ID
    name: String
    email: String
    password: String
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

  input UserInput {
    name: String
    email: String
    password: String
  }

  input UserCreate {
    name: String
    email: String
    password: String
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
    cardsByEmail(email: String!): [Card]
    cardsByType(volunType: String!): [Card]
    currentUser: User
    getUserCards(email: String!): UserCards
  }

  type Mutation {
    login(email: String!, password: String!): String
    createUser(input: UserCreate!): String
    updateUser(email: String!, input: UserInput!): String
    deleteUser(email: String!): String

    createCard(input: CardCreate!): Card
    updateCard(cardId: String!, input: CardInput!): String
    deleteCard(cardId: String!): String

    addUserCard(email: String!, cardId: String!): String
    deleteUserCard(email: String!, cardId: String!): String
  }
`);

module.exports = schema;
