const formEl = document.querySelector('form');

formEl.addEventListener('submit', event => {
  event.preventDefault();
  const userId = document.querySelector('[name="userId"]').value;
  const password = document.querySelector('[name="password"]').value;
  fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId, password
    })
  })
  .then(res => res.json())
  .then(data => console.log(data))
})

fetch('/fotki')
  .then(res => res.json())
  .then(data => console.log(data));

