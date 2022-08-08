const formEl = document.querySelector('form');
const photosContainer = document.querySelector('#photos');
const nameEl = document.querySelector('#user');
const err = document.querySelector('#error')
const loggedOutNav = document.querySelector('.logged-out');
const loggedinNav = document.querySelector('.logged-in');
const nav = document.querySelector('nav');
const linksEl = Array.from(document.querySelectorAll('nav a'));

window.addEventListener('DOMContentLoaded', () => {
  loggedinNav.style.display = 'none';
  homeView
  }
);


function createForm() {
  const form = document.createElement('form');
  const labelLogin = document.createElement('label');
  const inputEllogin = document.createElement('input');
  const labelPassword = document.createElement('label');
  const inputElpassword = document.createElement('input');
  const submitEl = document.createElement('input');

  labelLogin.textContent = 'Username:'
  labelPassword.textContent = 'Password:'
  inputEllogin.setAttribute('name', 'userId');
  inputEllogin.setAttribute('type', 'text');
  inputElpassword.setAttribute('type', 'password');
  inputElpassword.setAttribute('name', 'password');
  inputElpassword.setAttribute('autocomplete', 'true')
  submitEl.setAttribute('type', 'submit')
  submitEl.value = 'Login';

  labelLogin.appendChild(inputEllogin);
  labelPassword.appendChild(inputElpassword);
  form.appendChild(labelLogin);
  form.appendChild(labelPassword)
  form.appendChild(submitEl)
  document.body.insertBefore(form, photosContainer);

  form.addEventListener('submit', event => {
    event.preventDefault();
    console.log('handler')
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
      loggedinNav.style.display = 'block';
      loggedOutNav.style.display = 'none';
      pushToHistory('#/admin')
      // cleanView()
      adminView()
      getUser().then(displayUser)
      getPhotos().then(displayPhotos)
    })
    .catch(err => {
      if (err.message === 'unable to log in') {
        displayErrorMessage(err.message)
        loggedinNav.display.style = 'none'
        loggedOutNav.display.style = 'block'
      }
    })
  })
};

// function addLogout() {
//   const anchor = document.createElement('a');
//   anchor.textContent = 'logout';
//   console.log(anchor);
//   nav.appendChild(anchor)
  
//   anchor.addEventListener('click', e => {
//     logout();
//   })
// }

function logout() {
  fetch('/logout')
  .then(res => res.json())
  .then(data => {
    cleanView()
    displayErrorMessage(data.message)

  })
}


function deleteFormIfExists() {
  const form = document.querySelector('form');
  if(form) {
    document.body.removeChild(form);
  }
}

function displayPhotos(photos) {
  photos.forEach(photo => {
    photosContainer.innerHTML += `<div>filename: ${photo.name}, author: ${photo.author}</div>`
  })
}
function displayUser(user) {
  nameEl.innerHTML = `Hello ${user.firstName}`;
}
function displayErrorMessage(message) {
  err.innerHTML = message;
}

function loginUser(body) {
  return fetch('/login', body)
}

function getPhotos() {
  return fetch('/fotki').then(res => res.json())
}

function getUser() {
  return fetch('/user').then(res => {
    if(res.status === 401) {
      throw new Error('unauthorized', {cause: {status: res.status}})
    } else {
      return res.json()
    }
  })
}

function cleanView() {
  err.innerHTML = '';
  photosContainer.innerHTML = '';
  nameEl.innerHTML = '';
}

function homeView() {
  cleanView();
  console.log('home view');
  getPhotos().then(photos => displayPhotos(photos))
}

function loginView() {
  console.log('login view');
  cleanView();
  createForm()
}

function adminView() {
  cleanView();
  deleteFormIfExists()
  return getUser().then(user => {
    if(user.access?.superUser) {
      displayUser(user)
      getPhotos().then(photos => displayPhotos(photos))
      console.log('ok')
    } else {
      pushToHistory('#/');
      returnRoute('#/');
    }
  }).catch(() => {
    pushToHistory('#/login');
    loginView();
  })
}

function aboutView() {
  cleanView()
  photosContainer.innerHTML = `<h1>About</h1>`
}

const routes = {
  '#/': homeView,
  '#/home' : homeView,
  '#/admin': adminView,
  '#/login': loginView,
  '#/about': aboutView,
  '#/logout': logout
}

function returnRoute(path) {
  return routes[path]()
}

function pushToHistory(path) {
  window.history.pushState({}, "", path)
}

window.addEventListener('popstate', e => {
  deleteFormIfExists();
  const path = e.target.window.location.hash;
  pushToHistory(path);
  returnRoute(path);
})

const onNavItemClick = path => {
  deleteFormIfExists();
  pushToHistory(path);
}

linksEl.forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    deleteFormIfExists();
    onNavItemClick(e.target.hash);
    returnRoute(e.target.hash)
  })
})
