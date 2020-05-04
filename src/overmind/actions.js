import { googleSignIn } from '../auth/authhandle'

export const handleLogout = async ({state}) => {
    state.loggedIn = false;
    state.userProfileData = {}
}

export const googlehandleLogin = async ({state, effects}) => {
    state.loginStarted = true;
    state.userProfileData = await googleSignIn()
    await effects.postHandler(state.loginUrl, state.userProfileData)
    state.loggedIn = true
    state.signedIn = true;
    state.loginStarted = false;
    state.change["teamowner"] = state.userProfileData.username
}

export const createTeam = async ({state, effects}, values) => {
    state.addingTeam = true;
    state.newTeamData = await effects.postHandler(state.createTeamUrl, values)
    state.addingTeam = false;
    state.teamDataInfo[state.activeTeamId].isActive = false
    state.activeTeamId = state.newTeamData.teamid
    state.teamDataInfo[state.newTeamData.teamid] = {
        id : state.newTeamData.teamid,
        isActive : true,
        owner : state.newTeamData.teamowner,
        name : state.newTeamData.teamname,
        plan : 'Regular', 
        avatar : state.newTeamData.avatar,
        avatarUrlId : 266,
        magiclink : state.newTeamData.magiclink,
    }
}

export const teamsbyuserid = async ({state, effects}, values) => {
    let dump = await effects.postHandler(state.getTeamsUrl, values)
    return dump.teams
}

export const usersbyteamid = async ({state, effects}, values) => {
    let dump = await effects.postHandler(state.getTeamMembersUrl, values)
    return dump.users
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