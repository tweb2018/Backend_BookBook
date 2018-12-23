const { gql } = require('apollo-server-express');
const {
  GraphQLEmail,
  GraphQLURL,
  GraphQLDateTime,
  GraphQLLimitedString,
  GraphQLPassword,
  GraphQLUUID
} = require('graphql-custom-types');

const bookService = require('../services/bookService');
const bookStarsService = require('../services/bookStarsSevice');
const userService = require('../services/userService');

/* istanbul ignore next  */
const typeDefs = gql`
  scalar URL
  scalar Email
  scalar DateTime
  scalar LimitedString
  scalar Password
  scalar UUID

  type Book {
    id: ID!
    title: String
    authors: [String]
    summary: String
    published_date: DateTime
    thumbnail: URL
    comments: [Comment]
    averageNote: Float
  }

  type BookStars {
    bookId: ID!
    userId: ID!
    note: Float
  }

  type User {
    id: ID!
    login: String
    first_name: String
    last_name: String
    email: Email
    comments: [Comment]
    bookStars: [BookStars]
  }

  # TODO => Patrick
  type Comment {
    id: ID!
    bookId: String!
    userId: String!
    comment: String!
  }

  type Query {
    books(text: String, limit: Int): [Book]
    book(id: String!): Book
    bestBooks(limit: Int): [Book]
    profile: User
  }

  # TODO => Patrick
  input CommentInput {
    id: ID!
    bookId: String!
    userId: String!
    comment: String!
  }

  input UserInput {
    id: ID
    login: String
    first_name: String
    last_name: String
    email: Email
  }

  input BookStarsInput {
    bookId: ID!
    userId: ID!
    note: Float!
  }

  type Mutation {
    insertUser(data: UserInput!): User
    insertBookStars(data: BookStarsInput!): BookStars
    deleteBookStars(bookId: ID!, userId: ID!): Boolean
    deleteBookStarsByBookId(bookId: ID!): Boolean
    deleteBookStarsByUserId(userId: ID!): Boolean
  }
`;

/*
parent: an object that contains the result returned from 
      the resolver on the parent type
args: An object that contains the arguments passed to the field.
      ex: application(id: "5"
context: an object shared by all resolvers in GraphQL operation
        use for authentication
info: use this only in advanced cases.        
*/
const resolvers = {
  URL: GraphQLURL,
  Email: GraphQLEmail,
  DateTime: GraphQLDateTime,
  LimitedString: GraphQLLimitedString,
  Password: GraphQLPassword,
  UUID: GraphQLUUID,

  Query: {
    // args : book text (optional), limit (optionnal)
    books: async (parent, args, context, info) => {
      return await bookService.getBooks(args.text, args.limit);
    },
    // args : book id
    book: async (parent, args, context, info) => {
      return await bookService.getBook(args.id);
    },
    // args : limit (optionnal)
    bestBooks: async (parent, args, context, info) => {
      return bookService.getBestBook(args.limit);
    },
    profile: (parent, args, context, info) => {
      if (context.uuid === null) {
        console.log('uuid is null');
        return null;
      } else {
        console.log('Uuid from profile: ', context.uuid);
        const user = userService.getUser(context.uuid);
        console.log('User name: ', user.email);
        return user;
      }
    }
  },
  Book: {
    comments: async (parent, args, context, info) => {
      return []; // TODO => Patrick
    },
    averageNote: async (parent, args, context, info) => {
      return await bookService.getBookAverageNote(parent.id);
    }
  },
  User: {
    comments: async (parent, args, context, info) => {
      return []; // TODO => Patrick
    },
    bookStars: async (parent, args, context, info) => {
      return await bookService.getBookStarsByUserId(parent.id);
    }
  },

  Mutation: {
    insertUser: (_, { data }) => {
      const user = {
        id: data.id,
        login: data.login,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email
      };
      userService.insertUser(user);
      console.log(`User ${user.email} was inserted in dataBase`);
      return user;
    },
    insertBookStars: async (_, { data }) => {
      return await bookStarsService.insertBookStars(data);
    },
    deleteBookStars: async (_, { bookId, userId }) => {
      return await bookStarsService.deleteBookStars(bookId, userId);
    },
    deleteBookStarsByBookId: async (_, { bookId }) => {
      return await bookStarsService.deleteBookStarsByBookId(bookId);
    },
    deleteBookStarsByUserId: async (_, { userId }) => {
      return await bookStarsService.deleteBookStarsByUserId(userId);
    }
  }
};

module.exports = {
  typeDefs,
  resolvers
};
