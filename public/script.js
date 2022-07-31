const formEl = document.querySelector('form');
const photosContainer = document.querySelector('#photos');
const nameEl = document.querySelector('#user');
const err = document.querySelector('#error')
const nav = document.querySelector('nav');
const linksEl = Array.from(document.querySelectorAll('nav a'));


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
      addLogout()
      getUser().then(displayUser)
      getPhotos().then(displayPhotos)
    })
    .catch(err => {
      if (err.message === 'unable to log in') {
        displayErrorMessage(err.message)
      }
    })
  })
};

function addLogout() {
  const anchor = document.createElement('a');
  anchor.textContent = 'logout';
  console.log(anchor);
  nav.appendChild(anchor)
  
  anchor.addEventListener('click', e => {
    fetch('/logout').then((data) => {
      displayErrorMessage(data.message)
    })
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
  cleanView();
  console.log('login view');
  createForm()
}

function adminView() {
  cleanView();
  
  return getUser().then(user => {
    displayUser(user)
    getPhotos().then(photos => displayPhotos(photos))
  })
}

function contactView() {
  cleanView()
  console.log('contactView');
  photosContainer.innerHTML = `<h1>hello</h1>`
}

const route = '';
function returnRoute(route) {
  switch (route) {
    case '#/admin':
      deleteFormIfExists();
      adminView().catch(() => {
        pushToHistory('#/login');
        loginView()
      });
      break;
    case '#/login':
      deleteFormIfExists();
      loginView();
      break;
      case '#/contact':
        deleteFormIfExists();
        contactView();
        break;
    default:
      deleteFormIfExists();
      homeView();
  }
}

function pushToHistory(path) {
  window.history.pushState({}, "", path)
}

window.addEventListener('popstate', e => {
  const path = e.target.window.location.hash;
  console.log('popstate')
  pushToHistory(path);
  returnRoute(path);
})

const onNavItemClick = path => {
  pushToHistory(path);
}

linksEl.forEach(el => {
  el.addEventListener('click', e => {
    onNavItemClick(e.target.hash);
    returnRoute(e.target.hash)
  })
})
