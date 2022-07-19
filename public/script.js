const formEl = document.querySelector('form');
const photosContainer = document.querySelector('.photos');



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
  const allData = Promise.all([getUser('/user'), getPhotos('/fotki')])
  
  user.then(response => {
    if(response.status !== 201) {
      throw new Error('unable to log in')
    }
    return response.json()
  })
  .then(data => console.log(data))
  .then(() => Promise.all([getUser('/user'), getPhotos('/fotki')]))
  .then(res => console.log(res[0].firstName, res[1]))
  .then(err => console.log(err))

  // user.then(response => {
  //   if(response.status !== 201) {
  //     throw new Error('błąd');
  //   }
  //   return response.json()
  // })
  // .then(data => console.log(data))
  // .then(() => getPhotos('/fotki'))
  // .then(resp => resp.json())
  // .then(data => {
  //   data.forEach(item => {
  //     photosContainer.innerHTML += `<div>filename: ${item.name}, author: ${item.author}</div>`
  //   });
  //   console.log('finished');
  // })
  // .catch(err => {
  //   console.dir(err)
  //   if(err.message === 'błąd') {
  //     displayErrorMessage();
  //   }
  // })
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

// allData.then(res => console.log(res))


function displayErrorMessage() {
  // const p = document.createElement('p');
  // p.textContent = 'Invalid credentials';
  photosContainer.insertAdjacentHTML('beforebegin', '<p>Invalid credentials</p>')
}