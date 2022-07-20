const formEl = document.querySelector('form');
const photosContainer = document.querySelector('#photos');
const nameEl = document.querySelector('#user');
const err = document.querySelector('#error')



formEl.addEventListener('submit', event => {
  event.preventDefault();
  const userId = document.querySelector('[name="userId"]').value;
  const password = document.querySelector('[name="password"]').value;
  const body = { userId, password };
  const data = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
 
  loginUser(data).then(response => {
    cleanView()
    if (response.status !== 201) {
      throw new Error('unable to log in')
    }
  })
  .then(() => {
    getUser().then(displayUser)
    getPhotos().then(displayPhotos)
  })
  .catch(err => {
    if (err.message === 'unable to log in') {
      displayErrorMessage()
    }
  })
})

function displayPhotos(photos){
  photos.forEach(photo => {
    photosContainer.innerHTML += `<div>filename: ${photo.name}, author: ${photo.author}</div>`
  })
}
function displayUser(user) {
  nameEl.innerHTML = `Hello ${user.firstName}`;
}
function displayErrorMessage() {
  err.innerHTML = 'Invalid credentials';
}

function loginUser(body) {
  return fetch('/login', body)
}

function getPhotos() {
  return fetch('/fotki').then(res => res.json())
}

function getUser() {
  return fetch('/user').then(res => res.json())
}

function cleanView() {
  err.innerHTML = '';
  photosContainer.innerHTML = '';
  nameEl.innerHTML = '';
}