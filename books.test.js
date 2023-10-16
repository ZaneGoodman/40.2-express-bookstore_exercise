process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("./app");
const db = require("./db");

let testBook;

beforeEach(async function () {
  let book = await db.query(
    `INSERT INTO books VALUES ('152364525', 'https://amazon.com', 'Zane Goodman', 'English', 302, 'Princeten Gowl', 'Here to stay', 2017 ) RETURNING isbn, language`
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
    
    const response = await request(app).get(`/books/${testBook.isbn}`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      book: {
        isbn: "152364525",
        amazon_url : "https://amazon.com",
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


describe("/POST", function () {
  test("Creates new book instance", async () => {
    const response = await request(app).post('/books').send(
      
      {
        book: {
          isbn: "152356525",
          amazon_url: "https://amazon.com",
          author: "Zane Goodman",
          language: "English",
          pages: 302,
          publisher: "Princeten Gowl",
          title: "Here to stay",
          year: 2017,
        }
      }
    
    )
    
    expect(response.status).toEqual(201);
    expect(response.text).toContain("152356525")
    
  })
})

describe("PUT", function() {
  test("Should update book instance", async () => {
    const response = await request(app).put(`/books/${testBook.isbn}`).send(
      {
        book: {
          isbn: "152364525",
          amazon_url: "https://amazon.com",
          author: "Cody Wells",
          language: "Spanish",
          pages: 302,
          publisher: "Princeten Gowl",
          title: "Here to stay",
          year: 2017,
        }
      }
    )
 
      expect(response.status).toEqual(200)
      expect(response.text).toContain("Cody Wells")
      expect(response.body).toEqual(
        {
          book: {
            isbn: "152364525",
            amazon_url: "https://amazon.com",
            author: "Cody Wells",
            language: "Spanish",
            pages: 302,
            publisher: "Princeten Gowl",
            title: "Here to stay",
            year: 2017,
          }
        }
      )
  })
})

describe("DELETE", function() {
  test("Deletes a single a book", async function() {
    const response = await request(app)
      .delete(`/books/${testBook.isbn}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: "Book deleted" });
  });
});


