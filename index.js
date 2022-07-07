const crypto = require('crypto')
const express = require('express')
const { format } = require('path')
const app = express()
const port = 3000

const users = {
  admin: 'blabla' ,
  goska: '123',
  adam: '456'
}

const sessions = {};

// const images = {
//   image123: {
//     author: 'adam',
//     private: true
//   },
//   image234: {
//     author: 'goska',
//     private: false
//   },
//   image345: {
//     author: 'adam',
//     private: false
//   }
// }

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

app.post('/login', (req, res) => {
  if(users[req.body.userName] === req.body.password) {
    const id = crypto.randomUUID();
    sessions[id] = req.body.userName;
    console.log(sessions);
    res.status(201).send({"sessionId": id})
  } else {
    res.status(401).send({"message": "Invalid credentials"})
  }
})

app.get('/fotki', (req, res) => {
  console.log(sessions);
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