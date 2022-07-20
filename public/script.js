const formEl = document.querySelector('form');
const photosContainer = document.querySelector('.photos');
const nameEl = document.querySelector('.name');



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
    if (response.status !== 201) {
      throw new Error('unable to log in')
    }
  })
    .then(() => {
      document.querySelector('#error').innerHTML = '';
      getUser().then(user => {
        nameEl.innerHTML = `Hello ${user.firstName}`;
      })

      getPhotos().then(photos => {
        photos.forEach(photo => {
          photosContainer.innerHTML += `<div>filename: ${photo.name}, author: ${photo.author}</div>`
        })
      })
    })
    .catch(err => {
      console.dir(err)
      if (err.message === 'unable to log in') {
        displayErrorMessage()
      }
    })
})


function loginUser(body) {
  return fetch('/login', body)
}

function getPhotos() {
  return fetch('/fotki').then(res => res.json())
}

function getUser() {
  return fetch('/user').then(res => res.json())
}

function displayErrorMessage() {
  photosContainer.insertAdjacentHTML('beforebegin', '<p id="error">Invalid credentials</p>')
}