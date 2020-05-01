import { googleSignIn } from '../auth/authhandle'

export const handleLogout = async ({state, effects}) => {
    state.loggedIn = false
}

export const googlehandleLogin = async ({state, effects}) => {
    state.loggedIn = true
    state.signedIn = true;
    state.userProfileData = await googleSignIn()
}

export const createTeam = async ({state, effects}, values) => {
    state.newTeamData = await effects.postHandler(state.createTeamUrl, values)
}

export const handleChangeMutations = async ({state, effects}, values) => {
    state.change[values.target] = values.value
}