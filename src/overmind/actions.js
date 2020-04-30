import state from './state'
import effects from './effects'
import { googleSignIn } from '../auth/authhandle'

export const handleLogout = async ({state, effects}) => {
    state.loggedIn = false
}

export const googlehandleLogin = async ({state, effects}) => {
    state.loggedIn = true
    state.signedIn = true;
    state.postData = await googleSignIn() 
}