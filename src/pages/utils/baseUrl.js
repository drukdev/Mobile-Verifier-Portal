const fs = require('fs');
let book = {
  title: "1984",
  author: "George Orwell",
  read: true
};


let data = fs.readFileSync('books.json');
let books = JSON.parse(data);

books.push(book);


fs.writeFile('books.json', JSON.stringify(books), function(err) {
  if (err) {
    console.log(err);
  }
});
