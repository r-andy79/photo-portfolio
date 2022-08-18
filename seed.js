const sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('./mock.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error(err.message);

  console.log('connection successful');
  seedDatabase();

  db.close((err) => {
    if (err) return console.error(err.message);
  })
})

function seedDatabase() {
    seedUsers();
    seedSessions();
    seedImages();
}

function seedImages() {
    db.run(`CREATE TABLE IF NOT EXISTS images (name, author, private)`, [], err => {
        if (err) {
            console.error(err.message)
        } else {
            console.log('A images table has been created');
            insertPhoto('image123.jpg', 'adam', 'false');
            insertPhoto('image234.jpg', 'admin', 'false');
            insertPhoto('image345.jpg', 'goska', 'true');
            insertPhoto('image785.jpg', 'goska', 'false');
            insertPhoto('image456.jpg', 'adam', 'true');
            insertPhoto('image567.jpg', 'admin', 'true');
            insertPhoto('image678.jpg', 'adam', 'false');
        };
    });
}

function seedSessions() {
  db.run(`CREATE TABLE IF NOT EXISTS sessions (session_id, user_id)`, [], err => {
    if (err) return console.error(err.message);
    console.log('A sessions table was created');
  })
}

function insertPhoto(photoName, author, priv) {
    const sql = `INSERT INTO images(name, author, private) VALUES (?,?,?)`;
    db.run(sql, [photoName, author, priv], (err) => {
      if (err) return console.error(err.message)
      console.log('photo inserted')
    })
  }


function seedUsers() {
    db.run(`CREATE TABLE IF NOT EXISTS users (first_name, userId, password, access, id)`, [], err => {
        if (err) return console.error(err.message);
        console.log('A users table was created');
        insertUser('John', 'admin', 'blabla', 'superuser', '1')
        insertUser('goska', 'goska', '123', 'null', '2')
        insertUser('adam', 'adam', '456', 'null', '3')
    })
}

function insertUser(first_name, userId, password, access, id) {
    const sql = `INSERT INTO users (first_name, userId, password, access, id) VALUES(?,?,?,?,?)`
    db.run(sql, [first_name, userId, password, access, id], (err) => {
        if (err) return console.error({dupa: err.message});
        console.log('user was inserted');
    })
}
