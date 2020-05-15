import { googleSignIn } from '../auth/authhandle'
import ToastNotification from '../components/widgets/ToastNotification'
import { socket_live, events } from '../components/sockets'

/**
 * Handle Logout action of the app. 
 * Need to see if Google Sign-Out necessary. 
 */
export const handleLogout = async ({ state }) => {
    socket_live.emit(events.offline, {
        userid: state.userProfileData.userid,
        username: state.userProfileData.username,
        useremail: state.userProfileData.useremail,
        avatar: state.userProfileData.avatar
    })
    state.loggedIn = false;
}

/**
 * App Google Sign-in Handler.
 * See auth folder for more details.  
 */
export const googlehandleLogin = async ({ state, effects }) => {
    state.loginStarted = true;
    ToastNotification('info', "Logging In...🚀")
    state.userProfileData = await googleSignIn()
    let googleHandleData = await effects.postHandler(process.env.REACT_APP_LOGIN_URL, state.userProfileData)
    state.userProfileData.addStatus = googleHandleData.addStatus
    state.change["teamowner"] = state.userProfileData.username
    state.loggedIn = true
    state.signedIn = true;
    state.loginStarted = false;
}

/**
 * Create team. 
 * Emit new creation to fellow team mates
 * Add team to DB.
 */
export const createTeam = async ({ state, effects }, values) => {

    state.addingTeam = true;

    let newTeamData = await effects.postHandler(process.env.REACT_APP_CREATE_TEAM_URL, values)

    if (newTeamData !== undefined && newTeamData.addStatus !== 0) {

        if (!state.userProfileData.addStatus && state.activeTeamId !== 0)
            state.teamDataInfo[state.activeTeamId].isActive = false

        state.activeTeamId = newTeamData.teamid
        state.teamDataInfo[newTeamData.teamid] = {
            teamid: newTeamData.teamid,
            teamowner: newTeamData.teamowner,
            teamname: newTeamData.teamname,
            teamownerid: newTeamData.teamownerid,
            avatar: newTeamData.avatar,
            magiclink: newTeamData.magiclink,
            isActive: true,
            plan: 'Regular'
        }
        socket_live.emit(events.new_team, {
            teamid: state.activeTeamId,
            userid: state.userProfileData.userid,
            teamname: state.teamDataInfo[state.activeTeamId].teamname
        })
        socket_live.emit(events.team_switch, {
            teamid: state.activeTeamId,
            userid: state.userProfileData.userid,
            teamname: state.teamDataInfo[state.activeTeamId].teamname,
            username: state.userProfileData.username
        })
    } else if (newTeamData.addStatus === 0) {
        ToastNotification('error', "Team already exists")
    } else {
        ToastNotification('error', "Team creation failed")
    }

    state.addingTeam = false;
}

export const teamsbyuserid = async ({ state, effects }, values) => {

    state.loadingTeams = true
    state.loadingRooms = true
    state.loadingMembers = true

    let dump = await effects.postHandler(process.env.REACT_APP_GET_TEAMS_URL, values)

    if (Array.isArray(dump.teams) && dump.teams.length) {
        dump.teams.map((t) => {
            state.teamDataInfo[t.teamid] = {
                teamid: t.teamid,
                teamowner: t.teamowner,
                teamname: t.teamname,
                teamownerid: t.teamownerid,
                avatar: t.avatar,
                magiclink: t.magiclink,
                isActive: false,
                plan: 'Regular'
            }
        })
        if (state.activeTeamId === 0) {
            state.activeTeamId = dump.teams[0].teamid
            socket_live.emit(events.team_switch, {
                teamid: state.activeTeamId,
                userid: state.userProfileData.userid,
                teamname: state.teamDataInfo[state.activeTeamId].teamname,
                username: state.userProfileData.username
            })
        }
        state.teamDataInfo[state.activeTeamId].isActive = true
    } else {
        state.loadingRooms = false
        state.loadingTeams = false
        state.loadingMembers = false
        state.teamDataInfo = {}
        ToastNotification('error', "You don't belong to any team.")
    }

    state.loadingRooms = false
    state.loadingTeams = false
    state.loadingMembers = false
}

export const usersbyteamid = async ({ state, effects }, values) => {

    state.loadingMembers = true

    let dump = await effects.postHandler(process.env.REACT_APP_GET_TEAM_MEMBERS_URL, values)
    state.memberList = []

    if (Array.isArray(dump.users) && dump.users.length) {
        dump.users.map((u) => {
            let userObj = {
                userid: u.id,
                username: u.username,
                usermail: u.email,
                avatar: u.avatar,
                statusColor: 'green' 
            }
            state.memberList.push(userObj)
        })
    } else {
        ToastNotification('error', "Could not load users")
        state.loadingMembers = false
    }

    state.loadingMembers = false
}

export const handleChangeMutations = async ({ state }, values) => {
    state.change[values.target] = values.value
}

export const changeActiveTeam = async ({ state }, values) => {
    socket_live.emit(events.team_switch, {
        teamid: state.activeTeamId,
        userid: state.userProfileData.userid,
        teamname: state.teamDataInfo[state.activeTeamId].teamname,
        username: state.userProfileData.username
    })
    state.teamDataInfo[state.activeTeamId].isActive = false
    state.activeTeamId = values
    state.teamDataInfo[values].isActive = true
}

export const changeActiveRoom = async ({ state }, values) => {
    socket_live.emit(events.room_switch, {
        username: state.userProfileData.username,
        userid: state.userProfileData.userid,
        teamid: state.activeTeamId,
        roomid: values.roomid,
        roomname: values.roomname
    })
    state.activeRoomName = values.roomname
    state.activeRoomId = values.roomid
}

export const setOwnerName = async ({ state }, values) => {
    state.change[values.target] = values.value
}

export const addNewRoom = async ({ state, effects }, values) => {

    state.loadingRooms = true

    socket_live.emit(events.new_room, {
        teamid: values.teamid,
        roomname: values.roomname
    })

    let roomdump = await effects.postHandler(process.env.REACT_APP_ADD_ROOM_TO_TEAM, values)

    if (Array.isArray(roomdump.rooms) && roomdump.rooms.length) {
        roomdump.rooms.map((room) => {
            state.RoomListArray.unshift(room)
        })
    }

    state.loadingRooms = false
}

export const removeRoom = async ({ state, effects }, values) => {

    state.loadingRooms = true

    socket_live.emit(events.remove_room, {
        teamid: values.teamid,
        roomname: values.roomname
    })

    await effects.postHandler(process.env.REACT_APP_DELETE_ROOM_FROM_TEAM, values)
    let arr = await state.RoomListArray.filter((rooms) => {
        return rooms.id !== values.roomid
    })

    state.RoomListArray = arr
    state.loadingRooms = false
}

export const removeTeamMember = async ({ state, effects }, values) => {
    state.loadingMembers = true;

    socket_live.emit(events.remove_member, values)
    let arr = state.memberList.filter((member) => {
        return member.userid !== values.userid
    })

    await effects.postHandler(process.env.REACT_APP_DELETE_USER_FROM_TEAM, values)
    state.memberList = arr
    state.loadingMembers = false;
}

export const roomsbyteamid = async ({ state, effects }, values) => {
    state.loadingRooms = true
    let roomdump = await effects.postHandler(process.env.REACT_APP_GET_ROOMS_FROM_ID, values)

    state.RoomListArray = [];
    if (Array.isArray(roomdump.rooms) && roomdump.rooms.length) {
        roomdump.rooms.map((room) => {
            state.RoomListArray.push(room)
        })
    }

    state.loadingRooms = false
}