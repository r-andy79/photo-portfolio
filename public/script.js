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
  const user = loginUser('/', data);
  
  user.then(response => {
    if(response.status !== 201) {
      throw new Error('unable to log in')
    }
    return response.json()
  })
  .then(() => Promise.all([getUser('/user'), getPhotos('/fotki')]))
  .then(res => {
    const [user, photos] = res;
    nameEl.innerHTML = `Hello ${user.firstName}`;
    photos.forEach(photo => {
      photosContainer.innerHTML += `<div>filename: ${photo.name}, author: ${photo.author}</div>`
    })
  })
  .catch(err => {
    console.dir(err)
    if(err.message === 'unable to log in') {
      displayErrorMessage()
    }
  })
})

function loginUser(url, body) {
  return fetch(url, body)
}

function getPhotos(url) {
  return fetch(url).then(res => res.json())
}

function getUser(url) {
  return fetch(url).then(res => res.json())
}



function displayErrorMessage() {
  photosContainer.insertAdjacentHTML('beforebegin', '<p>Invalid credentials</p>')
}