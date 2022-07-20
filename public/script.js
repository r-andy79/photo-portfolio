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
  // .then(() => Promise.all([getUser('/user'), getPhotos('/fotki')]))
  .then(() => getData())
  // .then(res => {
  //   const [user, photos] = res;
  //   nameEl.innerHTML = `Hello ${user.firstName}`;
  //   photos.forEach(photo => {
  //     photosContainer.innerHTML += `<div>filename: ${photo.name}, author: ${photo.author}</div>`
  //   })
  // })
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

async function getData() {
  const url1 = '/user'
  const url2 = '/fotki'

  const response1 = await fetch(url1)
  const data1 = response1.json()

  const response2 = await fetch(url2)
  const data2 = response2.json()

  console.log(data1, data2)
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