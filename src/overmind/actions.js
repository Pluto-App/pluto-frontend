import state from './state'
import effects from './effects'
import { stat } from 'fs';

export const handleSignup = async ({state, effects}) => {
    window.require("electron").shell.openExternal('https://trumpetstechnologies.in/projects/pluto');
    await new Promise(resolve => setTimeout(resolve, 6000));
    state.signedIn = true
    await new Promise(resolve => setTimeout(resolve, 1000));
    state.signUptxt = ""
}

export const handleLogin = async ({state, effects}) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    state.signUptxt = "Logged In"
    state.loggedIn = true
    await new Promise(resolve => setTimeout(resolve, 1000));
    state.signUptxt = ""
}

export const handleLogout = async ({state, effects}) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    state.loggedIn = false
    state.signUptxt = "Logged Out"
    await new Promise(resolve => setTimeout(resolve, 1000));
    state.signUptxt = ""
}
