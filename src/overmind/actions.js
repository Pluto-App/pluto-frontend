import state from './state'
import effects from './effects'
import { stat } from 'fs';


export const handleLogin = async ({state, effects}) => {
    state.loggedIn = true
}

export const handleLogout = async ({state, effects}) => {
    state.loggedIn = false
}
