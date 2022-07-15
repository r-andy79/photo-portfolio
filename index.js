const crypto = require('crypto')
const express = require('express')
const cookieParser = require('cookie-parser');
const { format } = require('path')
const app = express()
const port = 3000

// app.use(express.urlencoded({extended: true}));
app.use(express.static('public'))
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

const users = {
  admin: {
    password: 'blabla',
    firstName: 'John',
    access: {superUser: true}
  },
  goska: {
    password: '123',
    firstName: 'Goska'
  },
  adam: {
    password: '456',
    firstName: 'Adam'
  }
}

const sessions = {
  // '204b61d3-f92e-47b4-b6dd-767057dad700': 'admin'
};

const images = [
  {
    name: 'image123.jpg',
    author: 'adam',
    private: false
  },
  {
    name: 'image234.jpg',
    author: 'admin',
    private: false
  },
  {
    name: 'image345.jpg',
    author: 'goska',
    private: true
  },
  {
    name: 'image785.jpg',
    author: 'goska',
    private: false
  },
  {
    name: 'image456.jpg',
    author: 'adam',
    private: true
  },
  {
    name: 'image567.jpg',
    author: 'admin',
    private: true
  },
]

app.get('/logout', (req, res) => {
  const sessionId = req.cookies?.session_id;
  console.log(req.cookies, sessions);
  if(!sessionId) {
    res.json({"message": "You're not logged in"})
    return
  }
  delete sessions[sessionId];
  res.clearCookie('session_id', sessionId).json({"message": "You have been logged out"});
})

app.get('/sessions', (req, res) => {
  res.send(sessions)
})

app.get('/', (req, res) => {
  res.render('index');
})

app.post('/', (req, res) => {
  console.log(req.body);
  const userId = req.body?.userId;
  const password = req.body?.password;
  if(!userId || !password) {
    res.status(400).json({"message": "invalid syntax"});
    return;
  }
  if(users[userId].password === password) {
    const sessionId = crypto.randomUUID();
    sessions[sessionId] = userId;
    res.cookie('session_id', sessionId);
    res.status(201).json({"message": "User logged in"});
  } else {
    res.status(401).json({"message": "Invalid credentials"})
  }
})

app.get('/fotki', (req, res) => {
  const sessionId = req.cookies?.session_id;
  const userId = sessions[sessionId];
  if(!userId) {
    const publicPhotos = images.filter(image => image.private === false);
    res.status(200).send(publicPhotos);
  } else {
    const allUserPhotos = images.filter(image => image.author === userId);
    const allPublicPhotos = images.filter(image => image.private === false);
    const allPhotos = [...allPublicPhotos, ...allUserPhotos];
    const filteredPhotos = [...new Set(allPhotos)];
    res.status(200).send(filteredPhotos);
  }
})

app.get('/user', getUsername, (req, res) => {
  console.log(req.user);
  if(!req.user) {
    res.status(401).json({"message": "User not logged in"})
    return;
  }     
  res.json(req.user);
})

function getUsername(req, res, next) {
  const sessionId = req.cookies?.session_id;
  const userId = sessions[sessionId] ?? undefined;
  const user = users[userId];
  req.user = user;
  next();
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})