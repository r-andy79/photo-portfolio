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
  db.run(sql, [sessionId, userId], (err) => {
    if (err) return console.error(err.message);
    console.log('A new row has been created');
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
  const sql = `INSERT INTO users (first_name, userId, password, access, id)
      VALUES(?,?,?,?,?)`
    db.run(sql, [first_name, userId, password, access, id], (err) => {
      if (err) return console.error({dupa: err.message});
      console.log('user was inserted');
    })
}



// const sql = `SELECT * FROM users`;
// const sql = `SELECT password from users WHERE userId = 'goska'`;
// const user = db.get(sql, [], (err, rows) => {
//   if(err) return console.error(err.message);
//   console.log(rows);
// })

// db.all(sql, [], (err, rows) => {
//   if (err) return console.error('-=------>', err.message);
//   console.log(rows);
// })



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
    db.get(`SELECT first_name from users WHERE userId = '${userId}'`, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows)
      }
    })
  })
}



app.get('/logout', (req, res) => {
  const sessionId = req.cookies?.session_id;
  console.log(req.cookies, sessions);
  if (!sessionId) {
    res.json({ "message": "You're not logged in" })
    return
  }
  delete sessions[sessionId];
  res.clearCookie('session_id', sessionId).json({ "message": "You have been logged out" });
})


app.get('/', (_, res) => {
  res.render('index');
})


app.post('/login', (req, res) => {
  // console.log(req.body);
  const userId = req.body?.userId;
  const password = req.body?.password;
  if (!userId || !password) {
    res.status(400).json({ "message": "invalid syntax" });
    return;
  }
  if (users[userId]?.password === password) {
    const sessionId = crypto.randomUUID();
    sessions[sessionId] = userId;
    const minute = 60 * 1000
    insertSession(sessionId, userId); // ufamy ze sie wykonala
    res.cookie('session_id', sessionId, { maxAge: 10 * minute }); // poczytać
    res.status(201).json({ "message": "User logged in" });
  } else {
    res.status(401).json({ "message": "Invalid credentials" })
  }
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
  // const userId = sessions[sessionId] ?? undefined;
  getSessionById(sessionId)
    .then(session => {
      return getUserById(session.user_id)
    })
    .then(user => {
      req.user = user;
      next();
    })
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})