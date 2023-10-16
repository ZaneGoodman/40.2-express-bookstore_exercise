process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("./app");
const db = require("./db");

let testBook;

beforeEach(async function () {
  let book = await db.query(
    `INSERT INTO books VALUES ('152364525', 'https://amazon.com', 'Zane Goodman', 'English', 302, 'Princeten Gowl', 'Here to stay', 2017 ) RETURNING isbn`
  );
  testBook = book.rows[0];
});

afterAll(async () => {
  await db.end();
});

afterEach(async () => {
  await db.query(`DELETE FROM books`);
});

describe("GET /books", function () {
  test("It should response with an object of books", async () => {
    const response = await request(app).get("/books");
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      books: [
        {
          isbn: "152364525",
          amazon_url: "https://amazon.com",
          author: "Zane Goodman",
          language: "English",
          pages: 302,
          publisher: "Princeten Gowl",
          title: "Here to stay",
          year: 2017,
        },
      ],
    });
  });
});

describe("GET/books/:id", function () {
  test("Should return the book object with matching id", async () => {
    console.log(testBook);
    const response = await request(app).get(`/books/${testBook.isbn}`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      book: {
        isbn: "152364525",
        amazon_url: "https://amazon.com",
        author: "Zane Goodman",
        language: "English",
        pages: 302,
        publisher: "Princeten Gowl",
        title: "Here to stay",
        year: 2017,
      },
    });
  });
});
