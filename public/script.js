const formEl = document.querySelector('form');
const photosContainer = document.querySelector('#photos');
const nameEl = document.querySelector('#user');
const err = document.querySelector('#error')
const linksEl = Array.from(document.querySelectorAll('nav a'));


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

function displayPhotos(photos) {
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

function renderInfo() {
  console.log('rendertttt');
  getUser().then(data => {
    contentDiv.innerHTML = data.userId ?? data.message;
  });
}

function getContact() {
  console.log('getContact')
  contentDiv.innerHTML = `<h1>get contact</h1>`
}

function loginPage() {
  formEl.style.display = "block";
}

function home() {
  contentDiv.innerHTML = `<h1>Home</h1>`;
}

let contentDiv = document.getElementById('content');

const routes = {
  '/': home,
  '/about': aboutPage,
  '/contact': getContact,
  '/login': loginPage,
  '/admin': renderInfo
}

// window.onpopstate = () => {
//   console.log("onpopstate")
//   contentDiv.innerHTML = routes[window.location.pathname];
// }


let onNavItemClick = (pathName) => {
  window.history.pushState(
    {},
    pathName,
    window.location.origin + pathName
    )
  routes[pathName]();
}

linksEl.forEach(el => {
  el.addEventListener('click', e => {
    onNavItemClick(e.target.dataset.location);
  })
})

console.log(window.location.pathname);
console.log(routes[window.location.pathname]);
routes[window.location.pathname]();