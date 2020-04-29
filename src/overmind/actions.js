import state from './state'
import effects from './effects'
import { stat } from 'fs';
import { googleSignIn } from '../auth/authhandle'

export const handleLogin = async ({state, effects}) => {
    state.loggedIn = true
}

export const handleLogout = async ({state, effects}) => {
    state.loggedIn = false
}

export const googlehandleLogin = async ({state, effects}) => {
    state.loggedIn = true
    state.signedIn = true;
    state.postData = await googleSignIn() 
}