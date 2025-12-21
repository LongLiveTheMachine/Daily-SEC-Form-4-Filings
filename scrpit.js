```javascript
const form = document.querySelector('#signup-form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.querySelector('#email-input').value;
  
  fetch('YOUR_GOOGLE_SCRIPT_URL', {
    method: 'POST',
    body: JSON.stringify({ email: email })
  }).then(() => alert('You are signed up!'));
});

```
