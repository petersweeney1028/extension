document.addEventListener('DOMContentLoaded', function() {
  const signInPage = document.getElementById('sign-in-page');
  const signedInPage = document.getElementById('signed-in-page');
  const savePageButton = document.getElementById('save-page');
  const loadPagesButton = document.getElementById('load-pages');
  const signOutButton = document.getElementById('sign-out');
  const backButton = document.getElementById('back-button');
  const articlesContainer = document.getElementById('articles-container');
  let userId = null;

  // Handle sign-in
  document.getElementById('sign-in').addEventListener('click', function() {
      chrome.runtime.sendMessage({ message: 'login' }, function(response) {
          if (response === 'success') {
              fetchUserInfo();
          } else {
              alert('Login failed. Please try again.');
          }
      });
  });

  // Handle sign-out
  signOutButton.addEventListener('click', function() {
      chrome.runtime.sendMessage({ message: 'logout' }, function(response) {
          if (response === 'success') {
              showSignInPage();
          }
      });
  });

  // Load articles
  loadPagesButton.addEventListener('click', function() {
      chrome.runtime.sendMessage({ message: 'get-articles', userId: userId, recent: false }, function(response) {
          articlesContainer.innerHTML = '';
          response.articles.forEach((article, index) => {
              const articleElement = document.createElement('div');
              articleElement.innerHTML = `<p>${index + 1}. <a href="${article.url}" target="_blank">${article.title}</a></p>`;
              articlesContainer.appendChild(articleElement);
          });

          // Adjust the popup width and hide other buttons
          document.body.style.width = '500px';
          savePageButton.style.display = 'none';
          loadPagesButton.style.display = 'none';
          signOutButton.style.display = 'none';
          backButton.style.display = 'block';
      });
  });

  // Save current page
  savePageButton.addEventListener('click', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          const activeTab = tabs[0];
          if (!activeTab || !activeTab.url || !activeTab.title) {
              console.error('Failed to get the active tab information');
              return;
          }

          const pageInfo = {
              userId: userId,
              url: activeTab.url,
              title: activeTab.title
          };

          chrome.runtime.sendMessage({ message: 'save-article', data: pageInfo }, function(response) {
              if (response === 'success') {
                  savePageButton.textContent = 'Saved';
                  savePageButton.disabled = true;
              } else {
                  console.error('Error saving article');
              }
          });
      });
  });

  // Handle back button
  backButton.addEventListener('click', function() {
      articlesContainer.innerHTML = '';
      document.body.style.width = '300px';
      savePageButton.style.display = 'block';
      loadPagesButton.style.display = 'block';
      signOutButton.style.display = 'block';
      backButton.style.display = 'none';
  });

  // Check if the user is signed in and update UI accordingly
  chrome.runtime.sendMessage({ message: 'isUserSignedIn' }, function(response) {
      if (response) {
          fetchUserInfo();
      } else {
          showSignInPage();
      }
  });

  function fetchUserInfo() {
      chrome.runtime.sendMessage({ message: 'get-user-info' }, function(userInfo) {
          if (userInfo) {
              userId = userInfo.sub;
              showSignedInPage();
          } else {
              showSignInPage();
          }
      });
  }

  function showSignInPage() {
      signInPage.style.display = 'block';
      signedInPage.style.display = 'none';
  }

  function showSignedInPage() {
      signInPage.style.display = 'none';
      signedInPage.style.display = 'block';
  }
});
