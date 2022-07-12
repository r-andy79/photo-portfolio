console.log('javascript');

fetch('/fotki')
  .then(res => res.json())
  .then(obj => console.log(obj));