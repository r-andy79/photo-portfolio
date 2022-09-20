import { randomUUID } from 'crypto';
import express, { static as ss, json } from 'express';
import upload from 'express-fileupload';
import sqlite3 from 'sqlite3'
import path from 'path'
import cookieParser from 'cookie-parser';
const app = express();
const port = 3000;

app.use(ss('public'))
app.use(ss('upload'))
app.use(json());
app.use(cookieParser());
app.use(upload());
app.set('view engine', 'ejs');

const db = new sqlite3.Database('./mock.sqlite', sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error(err.message);

  console.log('connection successful');
})

function insertSession(sessionId, userId) {
  const sql = `INSERT INTO sessions (session_id, user_id) VALUES (?,?)`;
  return new Promise((resolve, reject) => {
    db.run(sql, [sessionId, userId], (err, res) => {
      if (err) {
        reject(err)
      } else {
        console.log('session inserted');
        resolve(res)
      }
    })
  }) 
}

function insertPhoto(photoName, author, priv, meta) {
  const sql = `INSERT INTO images(name, author, private, meta) VALUES (?,?,?,?)`;
  db.run(sql, [photoName, author, priv, meta], (err) => {
    if (err) return console.error(err.message)
    console.log('photo inserted')
  })
}

function insertUser(first_name, userId, password, access, id) {
  const sql = `INSERT INTO users (first_name, userId, password, access, id) VALUES(?,?,?,?,?)`
    db.run(sql, [first_name, userId, password, access, id], (err) => {
      if (err) return console.error(err.message);
      console.log('user inserted');
    })
}


function getSessionById(sessionId) {
  const sql = `SELECT user_id from sessions WHERE session_id='${sessionId}'`;
  return new Promise((resolve, reject) => {
    db.get(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows)
      }
    })
  })
}

function getUserById(userId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * from users WHERE userId = '${userId}'`, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows)
      }
    })
  })
}

function removeData(data) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM sessions WHERE session_id='${data}'`, [], (err, result) => {
      if(err) {
        reject(err)
      } else {
        resolve(result);
      }
    })
  })
}

function getPublicPhotos() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * from images WHERE private='false'`, [], (err, data) => {
      if (err) {
        reject(err);
      } else {
        // console.log(result)
        resolve(data)
      }
    })
  })
}

function getAllPhotos(user) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * from images WHERE author = '${user}' UNION SELECT * from images WHERE private='false'`, [], (err, data) => {
      if(err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function insertFile(file) {
  let uploadPath;
  const __dirname = path.resolve(path.dirname(''));
  uploadPath = __dirname + '/upload/' + file.name;
  return new Promise((resolve, reject) => {
    file.mv(uploadPath, err => {
      if(err) {
        reject(err)
      } else {
        resolve(uploadPath)
      }
    })
  })
}

app.get('/logout', (req, res) => {
  const sessionId = req.cookies?.session_id;
  if (!sessionId) {
    return res.json({ "message": "You're not logged in" })
  }
  removeData(sessionId)
  .then(() => {
    res.clearCookie('session_id', sessionId).json({ "message": "You have been logged out" });
  })
})


app.get('/', (_, res) => {
  res.render('index');
})

app.post('/insert', (req, res) => {
  console.log('/insert', req.body)
  const author = req.body?.author;
  const fileEl = req.files?.sampleFile;
  const isPrivate = req.body?.isPrivate;
  const metaData = req.body?.metaData;
  console.log({author, fileEl, isPrivate, metaData});
  return insertFile(fileEl).then(fileLocation => insertPhoto(fileLocation, author, isPrivate, metaData)).then(() => res.status(200).json({ "message": "ok" }))
})


app.post('/login', (req, res) => {
  console.log('/login', req.body);
  const userId = req.body?.userId;
  const password = req.body?.password;
  if (!userId || !password) {
    return res.status(400).json({ "message": "invalid syntax" });
  }
  getUserById(userId).then(user => {
    console.log({ user })
    if(user.password !== password){
      console.error('BAD PASSWORD')
      return res.status(401).json({ "message": "Invalid credentials" })
    }
    const sessionId = randomUUID();
    // I made insertSession thenable, so I only respond with cookie once I finished inserting session
    return insertSession(sessionId, userId).then(() => {
      res.cookie('session_id', sessionId, { maxAge: 10 * 60 * 1000 }); // poczytać
      res.status(201).json({ "message": "User logged in" });
    })
  })
})

app.get('/fotki', getUsername, (req, res) => {
  if (!req.user) {
    getPublicPhotos().then(photos => res.status(200).send(photos))
  } else {
    getAllPhotos(req.user.userId).then(photos => res.status(200).send(photos))
  }
})

app.get('/user', getUsername, (req, res) => {
  console.log({ 'req.user': req.user });
  if (!req.user) {
    res.status(401).json({ "message": "User not logged in" })
    return;
  }
  res.json(req.user);
})

function getUsername(req, res, next) {
  const sessionId = req.cookies?.session_id;

  // I may or may NOT be logged in, we don't care, moving on
  if(!sessionId){
    return next() 
  }
  // but if I have the session cookie, let's check it:
  getSessionById(sessionId)
    .then(session => {
      // .THEN means I have corresponding session in my table so I go deeper:
      return getUserById(session.user_id)
    })
    .then(user => {
      //.THEN it seems I even have the user for this user_id, cool, I stick it into req
      req.user = user;
    })
    .catch(e => {
      // all rejects can happen here, but they all mean the same - there is no valid user
      console.log({ 'serious error? :)': e })
    })
    .finally(next) // so regardless, I always need to call next() - I don't stop processing requests
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})