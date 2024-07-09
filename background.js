
let user_signed_in = false;
const CLIENT_ID = encodeURIComponent("748596873331-qrgdo2taa49tqjib6gtsfrfpvdvbjkmg.apps.googleusercontent.com");
const RESPONSE_TYPE = encodeURIComponent("id_token");
const REDIRECT_URI = encodeURIComponent("https://cfkbnikmmnjfgdcblekccmebjjeacnib.chromiumapp.org");
const STATE = encodeURIComponent('jfkls3n');
const SCOPE = encodeURIComponent('openid');
const PROMPT = encodeURIComponent('consent');

function create_oauth2_url(){
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


function is_user_signed_in(){
    return user_signed_in;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {
    if(request.message === 'login'){
        if (is_user_signed_in()){
            console.log("user is already signed in.");
            } else {
                chrome.identity.launchWebAuthFlow({
                    'url': create_oauth2_url(),
                    'interactive': true
                }, function (redirect_url){
                    let id_token = redirect_url.substring(redirect_url.indexOf('id_token=')+9);
                    id_token = id_token.substring(0, id_token.indexOf('&'));
                    
                    
                    const user_info = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(id_token.split(".")[1]));

                    if ((user_info.iss == 'https://accounts.google.com' || user_info.iss === 'accounts.google.com')
                        && user_info.aud === CLIENT_ID){
                            chrome.browserAction.setPopup({popup:'/popup-signed-in.html'}, function(){
                                user_signed_in = true;
                                sendResponse('success');
                            });
                        }else {
                            console.log('could not authenticate')
                        }
                });

                return true
            }
     
    }else if(request.message === 'logout') {
        
    }else if(request.message === 'isUserSignedIn') {
        
    }

});