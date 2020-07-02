/* eslint-disable array-callback-return */
import { googleSignIn } from '../auth/authhandle'
import ToastNotification from '../components/widgets/ToastNotification'
import { socket_live, events } from '../components/sockets'

/**
 * Handle Logout action of the app. 
 * Need to see if Google Sign-Out necessary. 
 * Emit User went Offline.
 */
export const handleLogout = async ({ state }) => {
    socket_live.emit(events.offline, state.userProfileData.userid)
    state.loggedIn = false;
}

/**
 * App Google Sign-in Handler.
 * See auth folder for more details.  
 * Emit User is online.
 */
export const googlehandleLogin = async ({ state, effects }) => {
    state.loginStarted = true;
    ToastNotification('info', "Logging In...🚀")
    state.userProfileData = await googleSignIn()
    let LoginData = await effects.postHandler(process.env.REACT_APP_LOGIN_URL, state.userProfileData)
    state.userProfileData.addStatus = LoginData.addStatus
    state.teamowner = state.userProfileData.username
    socket_live.emit(events.online, state.userProfileData.userid)
    state.loggedIn = true
    state.signedUp = true;
    state.loginStarted = false;
}

/**
 * Create team. 
 * Emit new team creation to fellow team mates
 * Emit Team Switch as well. Since the default is 
 * to switch to new team. 
 * Add team to DB.
 */
export const createTeam = async ({ state, effects }, values) => {

    state.addingTeam = true;

    let newTeamData = await effects.postHandler(process.env.REACT_APP_CREATE_TEAM_URL, values)

    if (newTeamData !== undefined && newTeamData.addStatus !== 0) {

        if (!state.userProfileData.addStatus && state.activeTeamId !== 0)
            state.userTeamDataInfo[state.activeTeamId].isActive = false

        state.activeTeamId = newTeamData.teamid
        state.userTeamDataInfo[newTeamData.teamid] = {
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
            teamname: state.userTeamDataInfo[state.activeTeamId].teamname
        })
        socket_live.emit(events.team_switch, {
            teamid: state.activeTeamId,
            userid: state.userProfileData.userid,
            teamname: state.userTeamDataInfo[state.activeTeamId].teamname,
            username: state.userProfileData.username
        })
    } else if (newTeamData.addStatus === 0) {
        ToastNotification('error', "Team already exists")
    } else {
        ToastNotification('error', "Team creation failed")
    }

    state.addingTeam = false;
}

/**
 * Emit Team Switch and 
 * Load all the teams the user is a
 * part of.
 */
export const teamsbyuserid = async ({ state, effects }, values) => {

    state.loadingTeams = true
    state.loadingRooms = true
    state.loadingMembers = true

    let dump = await effects.postHandler(process.env.REACT_APP_GET_TEAMS_URL, values)

    if (Array.isArray(dump.teams) && dump.teams.length) {
        dump.teams.map((t) => {
            state.userTeamDataInfo[t.teamid] = {
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
        }
        socket_live.emit(events.team_switch, {
            teamid: state.activeTeamId,
            userid: state.userProfileData.userid,
            teamname: state.userTeamDataInfo[state.activeTeamId].teamname,
            username: state.userProfileData.username
        })
        state.userTeamDataInfo[state.activeTeamId].isActive = true
    } else {
        state.loadingRooms = false
        state.loadingTeams = false
        state.loadingMembers = false
        state.userTeamDataInfo = {}
        ToastNotification('error', "You don't belong to any team.")
    }

    state.loadingRooms = false
    state.loadingTeams = false
    state.loadingMembers = false
}

/** 
 * Load all team mates for a team from the DB. 
*/
export const usersbyteamid = async ({ state, effects }, values) => {

    state.loadingMembers = true

    let dump = await effects.postHandler(process.env.REACT_APP_GET_TEAM_MEMBERS_URL, values)
    state.teamMemberList = []
    state.userMapping = {}

    if (Array.isArray(dump.users) && dump.users.length) {
        dump.users.map((u) => {
            let userObj = {
                userid: u.id,
                username: u.username,
                usermail: u.email,
                avatar: u.avatar,
                statusColor: u.id === state.userProfileData.userid ? 'green' : 'gray', // default offline. 
                teamid : "", 
                roomid : ""
            }
            // TODO Remove the use of teamMemberList, Use userMapping.
            state.teamMemberList.push(userObj)
            state.userMapping[u.id] = {
                userid: u.id,
                username: u.username,
                usermail: u.email,
                avatar: u.avatar,
                statusColor: u.id === state.userProfileData.userid ? 'green' : 'gray', // default offline. 
                teamid : "", 
                roomid : ""
            }
        })
    } else {
        ToastNotification('error', "Could not load users")
        state.loadingMembers = false
    }

    state.loadingMembers = false
}

/**
 * Emit Team Switch Event
 */
export const changeActiveTeam = async ({ state }, values) => {
    state.userTeamDataInfo[state.activeTeamId].isActive = false
    state.activeTeamId = values
    state.userTeamDataInfo[values].isActive = true
    socket_live.emit(events.team_switch, {
        teamid: state.activeTeamId,
        userid: state.userProfileData.userid,
        teamname: state.userTeamDataInfo[state.activeTeamId].teamname,
        username: state.userProfileData.username
    })
}

/**
 * Emit Room Switch Event
 */
export const changeActiveRoom = async ({ state }, values) => {
    state.activeRoomName = values.roomname
    state.activeRoomId = values.roomid
    socket_live.emit(events.room_switch, {
        // Trial
        avatar : state.userProfileData.avatar,
        useremail: state.userProfileData.useremail,
        username: state.userProfileData.username,
        // Trial
        userid: state.userProfileData.userid,
        teamname: state.userTeamDataInfo[state.activeTeamId].teamname,
        teamid: state.activeTeamId,
        roomid: values.roomid,
        roomname: values.roomname
    })
}

/**
 * Emit new room creation to all team members. 
 * Add new room to DB.
 */
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

/**
 * Emit Room Deletion event. 
 */
// TODO Remove all team mates from the room. 
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

/**
 * Emit Team Member was removed. 
 */
export const removeTeamMember = async ({ state, effects }, values) => {
    state.loadingMembers = true;

    socket_live.emit(events.remove_member, values)
    let arr = state.teamMemberList.filter((member) => {
        return member.userid !== values.userid
    })

    await effects.postHandler(process.env.REACT_APP_DELETE_USER_FROM_TEAM, values)
    state.teamMemberList = arr
    state.loadingMembers = false;
}

/**
 * Load all rooms in the team by teamid. 
 */
// TODO What to do with joined team mates?
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

/**
 * 
 * @param {values.id} userid from data 
 * @param {values.statusColor} statusColor from data.
 * Update the Status Color of the User.  
 */
export const updateStatusColor = async ({ state, effects }, values) => {
    // TODO Update Status of the user at app Level, When users are active or not. 
    if (Array.isArray(state.teamMemberList) && state.teamMemberList.length) {
        let updateElem = await state.teamMemberList.find(element => element.userid === values.id)
        if (typeof updateElem !== 'undefined') 
            updateElem.statusColor = values.statusColor
    }
    // TODO Testing this map.
    if (typeof state.userMapping[values.id] !== 'undefined')
        state.userMapping[values.id].statusColor = values.statusColor
}

export const updateRoomOfMember = async ({ state, effects }, values) => {
    // TODO Update room of user. 
    // TODO Testing this map.
    if(typeof state.userMapping[values.userid] !== 'undefined')
        state.userMapping[values.userid].roomid = values.roomid;
}

export const updateTeamOfMember = async ({ state, effects }, values) => {
    // TODO Update team of user. 
    // TODO Testing this map.
    if (Array.isArray(state.teamMemberList) && state.teamMemberList.length) {
        let updateElem = await state.teamMemberList.find(element => element.userid === values.userid)
        if (typeof updateElem !== 'undefined') 
            updateElem.teamid = values.teamid;
    }
    if(typeof state.userMapping[values.userid] !== 'undefined')
        state.userMapping[values.userid].teamid = values.teamid
}