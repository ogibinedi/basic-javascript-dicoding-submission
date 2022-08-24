const STORAGE_KEY = 'books';
const SAVED_ITEM = 'saved-book';

const books = [];
const RENDER_EVENT = 'render-book';

// Searching feature
document.getElementById('searchSubmit').addEventListener("click", function (event){
  event.preventDefault();
  const searchBook = document.getElementById('searchBookTitle').value.toLowerCase();
  const bookList = document.querySelectorAll('.book_item h3:nth-child(1)');
    for (let book of bookList) {
      if (book.innerText.toLowerCase().includes(searchBook)) {
        book.parentElement.style.display = "block";
      } else {
        book.parentElement.style.display = "none";
    }
  }
});

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const bookCompletedRead = document.getElementById('inputBookIsComplete').checked;
    const generatedID = generatedId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookCompletedRead);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));

    saveBookData();
    
}

function generatedId(){
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompletedRead) {
    return {
        id,
        title,
        author,
        year,
        isCompletedRead
    };
}

function inputBook(bookObject) {
    const article = document.createElement('article');
    article.setAttribute('class', 'book_item');
    const titleOfBook = document.createElement('h3');
    titleOfBook.innerText = bookObject.title;
    const authorOfBook = document.createElement('p');
    authorOfBook.innerText = `Penulis: ${bookObject.author}`;
    const yearOfBook = document.createElement('p');
    yearOfBook.innerText = `Tahun: ${bookObject.year}`;

    article.append(titleOfBook, authorOfBook, yearOfBook);
    article.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isCompletedRead) {
        const beforeCompletedReadButton = document.createElement('button');
        beforeCompletedReadButton.setAttribute('class', 'green');
        beforeCompletedReadButton.innerText = "Belum Selesai dibaca";
        beforeCompletedReadButton.addEventListener('click', function () {
            undoBookFromCompletedRead(bookObject.id);
        });

        const removeBook = document.createElement('button');
        removeBook.setAttribute('class', 'red');
        removeBook.innerText = "Hapus Buku";
        removeBook.addEventListener('click', function () {
            alert('Yakin mau menghapus buku dari rak? Aksi ini tidak bisa dibatalkan!');
            removeBookFromCompletedRead(bookObject.id);
        });

        const actionContainer = document.createElement('div');
        actionContainer.setAttribute('class', 'action');
        actionContainer.append(beforeCompletedReadButton, removeBook);
        article.append(actionContainer);
    } else {
        const beforeReadButton = document.createElement('button');
        beforeReadButton.setAttribute('class', 'green');
        beforeReadButton.innerText = "Selesai dibaca";
        beforeReadButton.addEventListener('click', function () {
            addBookToCompletedRead(bookObject.id);
        });

        const removeBook = document.createElement('button');
        removeBook.setAttribute('class', 'red');
        removeBook.innerText = "Hapus Buku";
        removeBook.addEventListener('click', function () {
            alert('Yakin mau menghapus buku dari rak? Aksi ini tidak bisa dibatalkan!');
            removeBookFromCompletedRead(bookObject.id);
        });

        const actionContainer = document.createElement('div');
        actionContainer.setAttribute('class', 'action');
        actionContainer.append(beforeReadButton, removeBook);
        article.append(actionContainer);
    }

    return article;
}

function addBookToCompletedRead(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompletedRead = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveBookData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

function undoBookFromCompletedRead(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompletedRead = false;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveBookData();
}

function removeBookFromCompletedRead(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveBookData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveBookData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_ITEM));
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser anda tidak mendukung local storage');
        return false;
    }

    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    incompleteBookshelfList.innerHTML = "";
    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = "";


    for (bookItem of books) {
        const bookElement = inputBook(bookItem);

        if (!bookItem.isCompletedRead) {
            incompleteBookshelfList.append(bookElement);
        } else {
            completeBookshelfList.append(bookElement);
        }
    }
});

