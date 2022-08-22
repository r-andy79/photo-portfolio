const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const hash = crypto.createHash('sha256');


const db = new sqlite3.Database('./mock.sqlite', sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error(err.message);

  console.log('connection successful');
  seedDatabase()

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
  db.run(`CREATE TABLE IF NOT EXISTS images (
      name TEXT, 
      author TEXT, 
      private TEXT
      )`, [], err => {
    if (err) {
      console.error(err.message)
    } else {
      console.log('A images table has been created');
      insertPhoto('https://picsum.photos/id/1/600/400', 'adam', 'false');
      insertPhoto('https://picsum.photos/id/4/600/400', 'admin', 'false');
      insertPhoto('https://picsum.photos/id/7/600/400', 'goska', 'true');
      insertPhoto('https://picsum.photos/id/10/600/400', 'goska', 'false');
      insertPhoto('https://picsum.photos/id/13/600/400', 'adam', 'true');
      insertPhoto('https://picsum.photos/id/16/600/400', 'admin', 'true');
      insertPhoto('https://picsum.photos/id/19/600/400', 'adam', 'false');
      insertPhoto('https://picsum.photos/id/22/600/400', 'goska', 'false');
    };
  });
}

function seedSessions() {
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT, 
    user_id TEXT
    )`, [], err => {
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
  db.run(`CREATE TABLE IF NOT EXISTS users (
      first_name TEXT, 
      userId TEXT, 
      password TEXT, 
      access TEXT, 
      id INTEGER PRIMARY KEY AUTOINCREMENT
      )`, [], err => {
    if (err) return console.error(err.message);
    console.log('A users table was created');
    insertUser('John', 'admin', 'blabla', 'superuser')
    insertUser('goska', 'goska', '123', 'null')
    insertUser('adam', 'adam', '456', 'null')
  })
}

function insertUser(first_name, userId, password, access, id) {
  const sql = `INSERT INTO users (first_name, userId, password, access, id) VALUES(?,?,?,?,?)`
  db.run(sql, [first_name, userId, password, access, id], (err) => {
    if (err) return console.error({ dupa: err.message });
    console.log('user was inserted');
  })
}

function dropTable(table) {
  db.run(`DROP TABLE ${table}`, [], (err) => {
    if (err) {
      console.error(err.message)
    } else {
      console.log(`${table} table content deleted`);
    }
  })
}
