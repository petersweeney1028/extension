document.getElementById('sign-in').addEventListener('click', function () {
  chrome.runtime.sendMessage({ message: 'login' }, function(response) {
      if (response === 'success') {
          window.close();
      } else {
          alert('Login failed. Please try again.');
      }
  });
});

document.querySelector('button').addEventListener('click', function () {
  chrome.runtime.sendMessage({ message: 'isUserSignedIn' }, function(response) {
      alert(response ? 'User is signed in' : 'User is not signed in');
  });
});