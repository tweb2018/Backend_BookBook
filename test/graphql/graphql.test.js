if (process.env.NODE_MODE !== 'production') {
  /* eslint-disable global-require */
  require('dotenv').config({
    path: `${__dirname}/../../.env`
  });
  /* eslint-enable global-require */
}

const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('../../src/graphql/schema');
const { createTestClient } = require('apollo-server-testing');
const { db } = require('../../src/dataBase/database');
const bookDatabase = require('../../src/dataBase/bookDatabase');
const bookStarsDatabase = require('../../src/dataBase/bookStarsDatabase');
const { book, bookStars } = require('../dataBase/models');
const gql = require('graphql-tag');
const chai = require('chai');
const dirtyChai = require('dirty-chai');
const { expect } = chai;

chai.use(dirtyChai);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: undefined
});

const { query, mutate } = createTestClient(server);

const GET_BOOKS = gql`
  query Books($title: String, $limit: Int) {
    books(text: $title, limit: $limit) {
      id
      title
      authors
      summary
      published_date
      thumbnail
      averageNote
      comments {
        id
      }
    }
  }
`;

const GET_BOOK = gql`
  query Book($id: String!) {
    book(id: $id) {
      id
      title
      authors
      summary
      published_date
      thumbnail
      averageNote
      comments {
        id
      }
    }
  }
`;

const GET_BEST_BOOKS = gql`
  query BestBooks($limit: Int) {
    bestBooks(limit: $limit) {
      id
      title
      authors
      summary
      published_date
      thumbnail
      averageNote
      comments {
        id
      }
    }
  }
`;

let fetchBook = Object.assign({}, book);
fetchBook.averageNote = 0;
fetchBook.comments = [];

let fetchBookStars = Object.assign({}, bookStars);

const insertBook = async () => {
  await bookDatabase.insertBook(fetchBook);
};

const insertBookStars = async () => {
  await bookStarsDatabase.insertBookStars(fetchBookStars);
};

describe('graphql.test.js', function() {
  this.timeout(10000);

  const limit = 5;

  before(async () => {
    await db.connect();
    await db.clear();
  });

  afterEach(async () => {
    await db.clear();
  });

  after(async () => {
    await server.stop();
    await db.close();
  });

  it('Can fetch book', async () => {
    await insertBook();

    let compareBook = Object.assign({}, fetchBook);
    delete compareBook.cache_timestamp;

    const results = await query({
      query: GET_BOOK,
      variables: {
        id: fetchBook.id
      }
    });

    const dbBook = results.data.book;

    expect(dbBook).to.not.be.undefined();
    expect(dbBook).to.be.deep.equal(compareBook);
  });

  it('Can calculate book average', async () => {
    await insertBook();
    await insertBookStars();

    let compareBook = Object.assign({}, fetchBook);
    delete compareBook.cache_timestamp;
    compareBook.averageNote = fetchBookStars.note;

    const results = await query({
      query: GET_BOOK,
      variables: {
        id: fetchBook.id
      }
    });

    const dbBook = results.data.book;

    expect(dbBook).to.not.be.undefined();
    expect(dbBook).to.be.deep.equal(compareBook);
  });

  it('Can return zero if no stars', async () => {
    await insertBook();

    let compareBook = Object.assign({}, fetchBook);
    delete compareBook.cache_timestamp;

    const results = await query({
      query: GET_BOOK,
      variables: {
        id: fetchBook.id
      }
    });

    const dbBook = results.data.book;

    expect(dbBook).to.not.be.undefined();
    expect(dbBook).to.be.deep.equal(compareBook);
  });

  it('Can fetch books', async () => {
    await insertBook();

    const results = await query({
      query: GET_BOOKS,
      variables: {
        title: 'Mama mia',
        limit: limit
      }
    });

    const { books } = results.data;
    expect(books).to.not.be.undefined();
    expect(books.length).to.be.deep.equal(limit);
  });

  it('Can fetch five best books', async () => {
    // TODO
    /*await insertBookStars();

    const results = await query({
      query: GET_BEST_BOOKS,
      variables: {
        limit: limit
      }
    });

    const { bookStars } = results.data;
    expect(bookStars).to.not.be.undefined();
    expect(books.length).to.be.greaterThan(0);*/
  });
});
