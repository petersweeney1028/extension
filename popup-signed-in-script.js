document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('sign-out').addEventListener('click', function() {
        chrome.runtime.sendMessage({ message: 'logout' }, function(response) {
            if (response === 'success') window.close();
        });
    });

    document.getElementById('load-pages').addEventListener('click', function() {
        chrome.runtime.sendMessage({ message: 'get-articles', userId: 'your-user-id' }, function(response) {
            const articlesContainer = document.getElementById('articles-container');
            articlesContainer.innerHTML = '';
            response.articles.forEach(article => {
                const articleElement = document.createElement('div');
                articleElement.innerHTML = `<h3>${article.title}</h3><p>${article.url}</p>`;
                articlesContainer.appendChild(articleElement);
            });
        });
    });

    document.getElementById('save-page').addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const activeTab = tabs[0];
            const pageInfo = {
                userId: 'your-user-id',
                url: activeTab.url,
                title: activeTab.title
            };
            console.log('Saving article with:', pageInfo); // Log the data being sent
            chrome.runtime.sendMessage({ message: 'save-article', data: pageInfo }, function(response) {
                if (response === 'success') {
                    console.log('Article saved successfully');
                } else {
                    console.error('Error saving article');
                }
            });

        });
    });
});
