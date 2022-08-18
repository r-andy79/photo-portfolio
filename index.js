const crypto = require('crypto');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

app.use(express.static('public'))
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

const db = new sqlite3.Database('./mock.db', sqlite3.OPEN_READWRITE, (err) => {
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

function insertPhoto(photoName, author, priv) {
  const sql = `INSERT INTO images(name, author, private) VALUES (?,?,?)`;
  db.run(sql, [photoName, author, priv], (err) => {
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
  return new Promise((resolve, reject) => {
    db.get(`SELECT user_id from sessions WHERE session_id='${sessionId}'`, [], (err, rows) => {
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
    db.run(`DELETE FROM sessions WHERE session_id='${data}'`, [], (err, rows) => {
      if(err) {
        reject(err)
      } else {
        resolve(rows);
      }
    })
  })
}



app.get('/logout', (req, res) => {
  const sessionId = req.cookies?.session_id;
  // console.log(req.cookies, sessions);
  if (!sessionId) {
    return res.json({ "message": "You're not logged in" })
  }
  // delete sessions[sessionId]; // TODO: REMOVE FROM DB! :)
  removeData(sessionId)
  .then(() => {
    res.clearCookie('session_id', sessionId).json({ "message": "You have been logged out" });
  })
})


app.get('/', (_, res) => {
  res.render('index');
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
    const sessionId = crypto.randomUUID();
    // I made insertSession thenable, so I only respond with cookie once I finished inserting session
    return insertSession(sessionId, userId).then(() => {
      res.cookie('session_id', sessionId, { maxAge: 10 * 60 * 1000 }); // poczytać
      res.status(201).json({ "message": "User logged in" });
    })
  })
})

app.get('/fotki', getUsername, (req, res) => {
  if (!req.user) {
    // const publicPhotos = images.filter(image => image.private === false);
    const sql = `SELECT * from images WHERE private='false'`
    db.all(sql, [], (err, data) => {
      if (err) {
        return console.error(err.message)
      } else {
        res.status(200).send(data);
      }
    })
  } else {
    // const allUserPhotos = images.filter(image => image.author === req.user.userId);
    // const allPublicPhotos = images.filter(image => image.private === false);
    // const allPhotos = [...allPublicPhotos, ...allUserPhotos];
    // const filteredPhotos = [...new Set(allPhotos)];
    const sql = `SELECT * from images WHERE author = '${req.user.userId}' UNION SELECT * from images WHERE private='false'`;
    db.all(sql, [], (err, data) => {
      if (err) {
        return console.error(err.message)
      } else {
        res.status(200).send(data);
      }
    })
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