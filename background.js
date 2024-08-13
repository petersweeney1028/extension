let user_signed_in = false;
let user_info = null;

const CLIENT_ID = encodeURIComponent("748596873331-qrgdo2taa49tqjib6gtsfrfpvdvbjkmg.apps.googleusercontent.com");
const RESPONSE_TYPE = encodeURIComponent("id_token");
const REDIRECT_URI = encodeURIComponent("https://cfkbnikmmnjfgdcblekccmebjjeacnib.chromiumapp.org");
const STATE = encodeURIComponent('jfkls3n');
const SCOPE = encodeURIComponent('openid email profile');
const PROMPT = encodeURIComponent('consent');
const BACKEND_URL = 'https://read-extension-0e8dd740c240.herokuapp.com';

function create_oauth2_url() {
    let nonce = encodeURIComponent(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    let url = 
    `https://accounts.google.com/o/oauth2/v2/auth
?client_id=${CLIENT_ID}
&response_type=${RESPONSE_TYPE}
&redirect_uri=${REDIRECT_URI}
&scope=${SCOPE}
&state=${STATE}
&nonce=${nonce}
&prompt=${PROMPT}`;
    return url;
}

function is_user_signed_in() {
    return user_signed_in;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'login') {
        if (is_user_signed_in()) {
            console.log("User is already signed in.");
            sendResponse('success');
        } else {
            chrome.identity.launchWebAuthFlow({
                'url': create_oauth2_url(),
                'interactive': true
            }, function (redirect_url) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    sendResponse('error');
                    return;
                }
                
                let id_token = redirect_url.substring(redirect_url.indexOf('id_token=') + 9);
                id_token = id_token.substring(0, id_token.indexOf('&'));
                
                user_info = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(id_token.split(".")[1]));

                if ((user_info.iss == 'https://accounts.google.com' || user_info.iss === 'accounts.google.com')
                    && user_info.aud === CLIENT_ID) {
                    chrome.browserAction.setPopup({popup: '/popup.html'}, function() {
                        user_signed_in = true;

                        // Create or update user in the backend
                        fetch(`${BACKEND_URL}/create-user`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                googleId: user_info.sub,
                                email: user_info.email,
                                name: user_info.name
                            })
                        }).then(response => response.json())
                          .then(data => {
                              if (data.success) {
                                  console.log('User created/updated successfully.');
                                  sendResponse('success');
                              } else {
                                  console.error('Error creating/updating user:', data.error);
                                  sendResponse('error');
                              }
                          }).catch(error => {
                              console.error('Error creating/updating user:', error);
                              sendResponse('error');
                          });
                    });
                } else {
                    console.log('Could not authenticate');
                    sendResponse('error');
                }
            });

            return true; // Indicates we want to send a response asynchronously
        }
    } else if (request.message === 'logout') {
        chrome.browserAction.setPopup({popup: '/popup.html'}, function() {
            user_signed_in = false;
            user_info = null;
            sendResponse('success');
        });
    } else if (request.message === 'isUserSignedIn') {
        sendResponse(is_user_signed_in());
    } else if (request.message === 'get-user-info') {
        sendResponse(user_info);
    } else if (request.message === 'save-article') {
        const data = { ...request.data, userId: user_info.sub };
        fetch(`${BACKEND_URL}/save-article`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
          .then(data => {
              console.log('Article saved:', data);
              sendResponse('success');
          })
          .catch(error => {
              console.error('Error saving article:', error);
              sendResponse('error');
          });
        return true;
    } else if (request.message === 'get-articles') {
        fetch(`${BACKEND_URL}/get-articles/${user_info.sub}`)
            .then(response => response.json())
            .then(data => {
                sendResponse({ articles: data });
            })
            .catch(error => {
                console.error('Error fetching articles:', error);
                sendResponse({ articles: [] });
            });
        return true;
    }
});
