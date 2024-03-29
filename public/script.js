const formEl = document.querySelector('form');
const photosEl = document.querySelector('#photos');
const messageEl = document.querySelector('#message')
const linksEl = Array.from(document.querySelectorAll('nav a'));
const logoutLink = document.querySelector('#logout');
const loginLink = document.querySelector('#login');


// naturally, make the state slightly more persistent :)
const state = {
  userLoggedIn: false, // gets overwritten, so make it better ;)
  user: {
    firstName: undefined
  }
}


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
  form.setAttribute('id', 'form')
  form.appendChild(labelLogin);
  form.appendChild(labelPassword)
  form.appendChild(submitEl)
  document.body.insertBefore(form, photosEl);



  form.addEventListener('submit', event => {
    event.preventDefault();
    console.log('submit')
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
      state.userLoggedIn = true // this is simplistic but it's a start, maybe should be a function?
      doTheMagic('#/admin') // in the end we always do the same thing: rendering views :) (and urls)
    })
    .catch(err => {
      if (err.message === 'unable to log in') {
        displayMessage(err.message) // maybe this is separate view, maybe not..
      }
    })
  })
};

// helpers helpers...
function renderLogoutLoginMenu() {
  if(state.userLoggedIn === true){
    logoutLink.style.display = 'inline'
    loginLink.style.display = 'none'
  } else {
    logoutLink.style.display = 'none'
    loginLink.style.display = 'inline'
  }
}

function deleteFormIfExists() {
  const form = document.querySelector('form');
  form && document.body.removeChild(form);
}

function displayPhotos(photos) {
  photos.forEach(photo => {
    photosEl.innerHTML += `<div>filename: ${photo.name}, author: ${photo.author}</div>`
  })
}

function displayMessage(message) {
  messageEl.innerHTML = message;
}

function loginUser(body) {
  return fetch('/login', body)
}

function logOutUser(body) {
  return fetch('/logout', body).then(res => res.json())
}

function getPhotos() {
  return fetch('/fotki').then(res => res.json())
}

function getUser() {
  return fetch('/user').then(res => {
    if(res.status === 401) {
      state.userLoggedIn = false // backend says NO, backend knows better - we should always catch this and react, not just here, but everywhere
      throw new Error('unauthorized', {cause: {status: res.status}})
    } else {
      return res.json()
    }
  })
}

// at this point all of this idempotent because it never fails
function cleanView() {
  // console.log('clean view :)')
  messageEl.innerHTML = '';
  photosEl.innerHTML = '';
  deleteFormIfExists() // example of idempotent, just works, always
}

function logoutView() {
  console.log('logout view!');
  logOutUser()
  .then(data => {
    state.userLoggedIn = false // again, just remember it somewhere
    displayMessage(data.message)
    renderLogoutLoginMenu() // this is called on log in and out (client side) at the moment, but it could be called always, on render
  })
}

function loginView() {
  console.log('login view!');
  displayMessage("Please log in")
  createForm()
}

function homeView() {
  console.log('home view!');
  displayMessage("No place like home")
  getPhotos().then(displayPhotos)
}

function aboutView() {
  displayMessage("What this is all about?")
}


function adminView() {
  console.log('admin view!');
  cleanView(); // u need it SOMEWHERE in this automated flow, but where?
  
  return getUser().then(user => {
      displayMessage(`Hello ${user.firstName}`)
      getPhotos().then(displayPhotos)
    }).catch(() => {
    displayMessage('Prove you are admin by <a href="/#/login">logging in</a>') // dirty little boy, but no redirect loops!
  })
}

function view404(path){
  console.log('404!');
  displayMessage(`No place like ${path}, go <a href="/#/">home</a>`)
}


function renderRoute(path) {
  console.log({path}); 
  const routes = {
    '#/':       homeView,
    '#/admin':  adminView,
    '#/login':  loginView,
    '#/about':  aboutView,
    '#/logout': logoutView,
    '#/404': view404
  }
  const fn = routes[path]
  if(!fn){
    pushToHistory('/#/404'); // TODO: history loop again...
    view404(path);
    return
  } 
  fn(path)
}



function pushToHistory(path) {
  window.history.pushState({}, "", path)
}

// wrappers wrappers, helpers helpers
function doTheMagic(hash){
  // console.log('doTheMagic()');
  // console.log('document.cookie', document.cookie)
  
  // simplistic but works -> ALWAYS cheaply check if user is logged in by knowing if the session cookie exists 
  state.userLoggedIn = !!document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('session_id'))
  // console.log(state);

  cleanView()
  renderLogoutLoginMenu()
  pushToHistory(hash); 
  renderRoute(hash);

}

window.addEventListener('popstate', e => {
  // console.log('POPSTATE!')
  doTheMagic(e.target.window.location.hash)
})



linksEl.forEach(el => {
  el.addEventListener('click', e => {
    // console.log('ON MENU CLICK')
    e.preventDefault();
    doTheMagic(e.target.hash)
  })
})

window.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM CONTENT LOADED')
    doTheMagic(window.location.hash)
  }
);
