import {parse} from 'url'
import axios from 'axios'
import qs from 'qs'

const remote = window.require('electron').remote
const { session } = window.require('electron')

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'
const GOOGLE_REDIRECT_URI = 'http://www.s3ed4tf.com'
const GOOGLE_CLIENT_ID = '43442370807-gj07kd9t0gh5le38n84pn7hqofnfcinq.apps.googleusercontent.com'

export const signInWithPopup = async () => {
    return new Promise((resolve, reject) => {
      const authWindow = new remote.BrowserWindow({
        width: 500,
        height: 600,
        show: true,
        titleBarStyle: 'hiddenInset', 
        // frame: false,
        webPreferences: {
          nodeIntegration: false, 
          nativeWindowOpen: true
        }
      })
  
      // TODO: Generate and validate PKCE code_challenge value
      const urlParams = {
        response_type: 'code',
        redirect_uri: GOOGLE_REDIRECT_URI,
        client_id: GOOGLE_CLIENT_ID,
        scope: 'profile email',
      }
      const authUrl = `${GOOGLE_AUTHORIZATION_URL}?${qs.stringify(urlParams)}`
  

      // Fixed redirect_uri. 
      const handleNavigation = (url) => {
        const query = parse(url, true).query
        if (query) {
          if (query.error) {
            reject(new Error(`There was an error: ${query.error}`))
          } else if (query.code) {
            // TODO Add code for redirect check. 

            // Login is complete
            authWindow.removeAllListeners('closed')
            setImmediate(() => authWindow.close())
              // This is the authorization code we need to request tokens
            resolve(query.code)
          }
        }
      }
  
      authWindow.on('closed', () => {
        // TODO: Handle this smoothly
        throw new Error('Auth window was closed by user')
      })

      authWindow.webContents.on('did-finish-load', function () {
        // TODO Cant keep frameless. 
        authWindow.loadURL(authUrl, {userAgent: 'Chrome'});
      });
  
      authWindow.webContents.on('will-navigate', (event, url) => {
        handleNavigation(url)
      })
  
      // Depreciated. 
      // authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
      //   alert("Login Started")
      //   handleNavigation(newUrl)
      // })

      var filter = {
        urls: [GOOGLE_REDIRECT_URI + '*']
      };

      // New Way, but need to test it.
      // session.defaultSession.webRequest.onCompleted(filter, (details) => {
      //   var url = details.url;
      //   handleNavigation(url);
      // });
      
    })
  }

  export const fetchAccessTokens = async (code) => {
    const response = await axios.post(GOOGLE_TOKEN_URL, qs.stringify({
      code,
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  }

  export const fetchGoogleProfile = async (accessToken) => {
    const response = await axios.get(GOOGLE_PROFILE_URL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
    return response.data
  }