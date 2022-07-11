const crypto = require('crypto')
const express = require('express')
const { format } = require('path')
const app = express()
const port = 3000

app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const users = {
  admin: 'blabla' ,
  goska: '123',
  adam: '456'
}

const sessions = {};

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
    name: 'image456.jpg',
    author: 'adam',
    private: true
  },
  {
    name: 'image567.jpg',
    author: 'admin',
    private: true
  }
]

app.use(express.json())

app.get('/login', (req, res) => {
  res.render('login');
})

app.get('/admin', (req, res) => {
  res.render('admin');
})

app.get('/sessions', (req, res) => {
  res.send(sessions)
})

app.post('/login', (req, res) => {
  if(users[req.body.userName] === req.body.password) {
    console.log(req.body.userName);
    const id = crypto.randomUUID();
    sessions[id] = req.body.userName;
    res.status(201).redirect('/admin');
  } else {
    res.status(401).send({"message": "Invalid credentials"})
  }
})

app.get('/fotki', (req, res) => {
  console.log(req.params);
  if(sessions[req.body.id] !== undefined) {
    const privatePhotos = images.filter(image => image.author === sessions[req.body.id]);
    const publicPhotos = images.filter(image => image.private === false);
    const allPhotos = [...publicPhotos, ...privatePhotos];
    const filteredPhotos = [...new Set(allPhotos)];
    res.status(200).send(filteredPhotos);
  } else {
    const publicPhotos = images.filter(image => image.private === false);
    res.status(200).send(publicPhotos);
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})