import { parse } from 'url'
import axios from 'axios'
import qs from 'qs'
import { auth } from 'firebase'

const electron = window.require('electron')

const REACT_APP_GOOGLE_AUTHORIZATION_URL='https://accounts.google.com/o/oauth2/v2/auth'
const REACT_APP_GOOGLE_TOKEN_URL='https://www.googleapis.com/oauth2/v4/token'
const REACT_APP_GOOGLE_PROFILE_URL='https://www.googleapis.com/userinfo/v2/me'
const REACT_APP_GOOGLE_REDIRECT_URI='http://verify.pluto-office.com'
const REACT_APP_GOOGLE_CLIENT_SECRET='ST8rCDTHlxd8rt_GDEfZ2Qas'
const REACT_APP_GOOGLE_CLIENT_ID='43442370807-7jk41hq8c4uqi10pi1beubfma1s3qcln.apps.googleusercontent.com'

// New OAuth Creds
// const REACT_APP_GOOGLE_REDIRECT_URI='http://verify.pluto-office.com'
// const REACT_APP_GOOGLE_CLIENT_SECRET='hwS5p_swd6N9TBuMSTy2cgcP'
// const REACT_APP_GOOGLE_CLIENT_ID='535193691278-fnl1o968cuck09sum0mdfg00of0e3tf5.apps.googleusercontent.com'

export const signInWithPopup = async () => {
    return new Promise((resolve, reject) => {
      const authWindow = new electron.remote.BrowserWindow({
        width: 650,
        height: 650,
        show: true,
        titleBarStyle: 'hiddenInset', 
        // frame: false,  // TODO Render top bar in login-auth pagw
        webPreferences: {
          nodeIntegration: false, 
          nativeWindowOpen: true
        }
      })

      // Remove file mennu
      authWindow.setMenu(null);
  
      // TODO: Generate and validate PKCE code_challenge value
      const urlParams = {
        response_type: 'code',
        redirect_uri: REACT_APP_GOOGLE_REDIRECT_URI,
        client_id: REACT_APP_GOOGLE_CLIENT_ID,
        scope: 'profile email',
      }
      const authUrl = `${REACT_APP_GOOGLE_AUTHORIZATION_URL}?${qs.stringify(urlParams)}`
  

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
  
      authWindow.webContents.on('will-navigate', (event, url) => {
        handleNavigation(url)
      })
  
      // Depreciated. did-get-redirect-request
      authWindow.webContents.on('did-redirect-navigation', (event, newUrl) => {
        handleNavigation(newUrl)
      })

       // User Agent needed, or else google will complain and stop auth process.
      authWindow.loadURL(authUrl, {userAgent: 'Chrome'}); 
    })
  }

  export const fetchAccessTokens = async (code) => {
    const response = await axios.post(REACT_APP_GOOGLE_TOKEN_URL, qs.stringify({
      code,
      client_id: REACT_APP_GOOGLE_CLIENT_ID,
      redirect_uri: REACT_APP_GOOGLE_REDIRECT_URI,
      client_secret: REACT_APP_GOOGLE_CLIENT_SECRET, // necessary
      grant_type: 'authorization_code',
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  }

  export const fetchGoogleProfile = async (accessToken) => {
    const response = await axios.get(REACT_APP_GOOGLE_PROFILE_URL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
    return response.data
  }