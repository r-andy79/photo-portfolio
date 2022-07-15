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
  user.then(response => response.json())
    .catch(err => console.error(err))
    .then(data => console.log(data))
    .then(resp => getPhotos('/fotki'))
    .then(resp => resp.json())
    .then(data => {
      data.forEach(item => {
        photosContainer.innerHTML += `<div>filename: ${item.name}, author: ${item.author}</div>`
      });
    })

})

function loginUser(url, body) {
  return fetch(url, body)
}

function getPhotos(url) {
  return fetch(url)
}