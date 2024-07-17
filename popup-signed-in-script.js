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
            console.log('Active tab:', activeTab);

            if (!activeTab || !activeTab.url || !activeTab.title) {
                console.error('Failed to get the active tab information');
                return;
            }

            const pageInfo = {
                userId: 'your-user-id',
                url: activeTab.url,
                title: activeTab.title
            };

            console.log('Saving article with:', pageInfo);

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
