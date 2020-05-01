import { googleSignIn } from '../auth/authhandle'

export const handleLogout = async ({state}) => {
    state.loggedIn = false
}

export const googlehandleLogin = async ({state, effects}) => {
    state.loginStarted = true;
    state.userProfileData = await googleSignIn()
    await effects.postHandler(state.loginUrl, state.userProfileData)
    state.loggedIn = true
    state.signedIn = true;
    state.loginStarted = false;
    state.change["teamowner"] = state.userProfileData.name
}

export const createTeam = async ({state, effects}, values) => {
    state.newTeamData = await effects.postHandler(state.createTeamUrl, values)
    state.teamDataInfo[state.activeTeamId].isActive = false
    state.teamDataInfo[state.newTeamData.id] = {
        id : state.newTeamData.id,
        isActive : true,
        owner : state.newTeamData.owner,
        name : state.newTeamData.name,
        plan : 'Regular', // change later.
        avatarUrlId : 854,
        members : [],
    }
}

export const handleChangeMutations = async ({state}, values) => {
    state.change[values.target] = values.value
}

export const changeActiveTeam = async ({state}, values) => {
    state.teamDataInfo[state.activeTeamId].isActive = false
    state.activeTeamId = values
    state.teamDataInfo[values].isActive = true
}

export const setOwnerName = async ({state}, values) => {
    state.change[values.target] = values.value
}