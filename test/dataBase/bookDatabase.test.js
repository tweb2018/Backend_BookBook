if (process.env.NODE_MODE !== 'production') {
  /* eslint-disable global-require */
  require('dotenv').config({
    path: `${__dirname}/../../.env`
  });
  /* eslint-enable global-require */
}

const chai = require('chai');
const dirtyChai = require('dirty-chai');
const bookDatabase = require('../../src/dataBase/bookDatabase');
const { book } = require('./models');
const { expect } = chai;
const CACHE_TIME = parseInt(process.env.CACHE_TIME);

chai.use(dirtyChai);

describe('bookDatabase.test.js', function() {
  this.timeout(10000);

  before(done => {
    bookDatabase.connect();
    bookDatabase.clear(done);
  });

  after(done => {
    bookDatabase.close(done);
  });

  it('Can insert book', async () => {
    const result = await bookDatabase.insertBook(book);
    expect(result).to.not.be.undefined();
    expect(result.id).to.be.equal(book.id);
    expect(result.title).to.be.deep.equal(book.title);
  });

  it('Can get books', async () => {
    const result = await bookDatabase.getBooks('', 5);
    expect(result.length).to.be.greaterThan(0);
  });

  it('Can get book by id', async () => {
    const result = await bookDatabase.getBook(book.id);
    expect(result).to.not.be.undefined();
    expect(result.id).to.be.equal(book.id.id);
    expect(result.title).to.be.deep.equal(book.title);
  });

  it('Can update book', async () => {
    book.title = 'new_title';
    const result = await bookDatabase.updateBook(book);
    expect(result).to.not.be.undefined();
    expect(result.id).to.be.equal(book.id.id);
    expect(result.title).to.be.deep.equal(book.title);
  });

  it('Can refresh book cache', async () => {
    setTimeout(async () => {
      const result = await bookDatabase.insertBook(book);
      expect(result).to.not.be.undefined();
      expect(result.cache_timestamp).to.be.greaterThan(book.cache_timestamp);
      book.cache_timestamp = result.cache_timestamp;
    }, CACHE_TIME * 1000);
  });

  it('Can get book from cache', async () => {
    const result = await bookDatabase.insertBook(book);
    const cacheResult = await bookDatabase.getBook(book.id);
    expect(result).to.not.be.undefined();
    expect(cacheResult).to.not.be.undefined();
    expect(result.cache_timestamp).to.be.deep.equal(
      cacheResult.cache_timestamp
    );
  });

  it('Can return book from cache when insertion and timestamp valid', async () => {
    const result = await bookDatabase.insertBook(book);
    const cacheResult = await bookDatabase.insertBook(book);
    expect(result).to.not.be.undefined();
    expect(cacheResult).to.not.be.undefined();
    expect(result.cache_timestamp).to.be.deep.equal(
      cacheResult.cache_timestamp
    );
  });
});
