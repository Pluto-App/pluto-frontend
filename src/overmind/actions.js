import { googleSignIn } from '../auth/authhandle'

export const handleLogout = async ({state}) => {
    state.loggedIn = false;
    state.userProfileData = {}
}

export const googlehandleLogin = async ({state, effects}) => {
    state.loginStarted = true;
    state.userProfileData =  await googleSignIn()
    await effects.postHandler(state.loginUrl, state.userProfileData)
    state.loggedIn = true
    state.signedIn = true;
    state.loginStarted = false;
    state.change["teamowner"] = state.userProfileData.username
}

export const createTeam = async ({state, effects}, values) => {

    state.addingTeam = true;
    let newTeamData = await effects.postHandler(state.createTeamUrl, values)
    state.addingTeam = false;

    state.teamDataInfo[state.activeTeamId].isActive = false

    state.activeTeamId = newTeamData.teamid
    state.teamDataInfo[newTeamData.teamid] = {
        teamid : newTeamData.teamid,
        teamowner : newTeamData.teamowner,
        teamname : newTeamData.teamname,
        avatar : newTeamData.avatar,
        magiclink : newTeamData.magiclink,
        isActive : true,
        plan : 'Regular'
    }
}

export const teamsbyuserid = async ({state, effects}, values) => {
    let dump = await effects.postHandler(state.getTeamsUrl, values)
    state.teamDataInfo[state.activeTeamId].isActive = false
    if (dump.teams !== []) {
        dump.teams.map((t) => {
            state.teamDataInfo[t.teamid] = {
                teamid : t.teamid,
                teamowner : t.teamowner,
                teamname : t.teamname,
                avatar : t.avatar,
                magiclink : t.magiclink,
                isActive : false,
                plan : 'Regular'
            }
        })
    }
    state.teamDataInfo[state.activeTeamId].isActive = true
    return null;
}

// export const usersbyteamid = async ({state, effects}, values) => {
//     let dump = await effects.postHandler(state.getTeamMembersUrl, values)
//     return dump.users
// }

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