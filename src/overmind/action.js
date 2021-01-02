/* eslint-disable array-callback-return */
import ToastNotification from '../components/widgets/ToastNotification'
import { socket_live, events } from '../components/sockets'


/**
 * Emit Room Switch Event
 */
export const changeActiveRoom = async ({ state }, values) => {
    state.activeRoomName = values.roomname
    state.activeRoomId = values.roomid
    socket_live.emit(events.room_switch, {
        // Trial
        avatar: state.userProfileData.avatar,
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
 * Update the user status Color. 
 * @method 
 * @param {values.id} userid from data 
 * @param {values.statusColor} statusColor from data.  
 */
export const updateStatusColor = async ({ state, effects }, values) => {
    // TODO Update Status of the user at app Level, When users are active or not. 
    if (Array.isArray(state.teamMemberList) && state.teamMemberList.length) {
        let updateElem = await state.teamMemberList.find(element => element.userid === values.userid)
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
    if (typeof state.userMapping[values.userid] !== 'undefined')
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
    if (typeof state.userMapping[values.userid] !== 'undefined')
        state.userMapping[values.userid].teamid = values.teamid
}

export const removeFromRoom = ({ state, effects }, values) => {
    state.activeRoomId = 0;
    state.activeRoomName = "";
    socket_live.emit(events.room_switch, {
        // Trial
        avatar: state.userProfileData.avatar,
        useremail: state.userProfileData.useremail,
        username: state.userProfileData.username,
        // Trial
        userid: state.userProfileData.userid,
        teamname: state.userTeamDataInfo[state.activeTeamId].teamname,
        teamid: state.activeTeamId,
        roomid: state.activeRoomId,
        roomname: state.activeRoomName
    })
}

export const sendRoomBroadcast = async ({ state, effects }, values) => {
    socket_live.emit(events.room_broadcast, values)
}

export const addNewTeamMember = async ({ state, effects }, values) => {
    var userObj = values
    userObj.roomid = ""
    state.teamMemberList.push(userObj)
    state.userMapping[values.userid] = userObj
}

export const addNewEmitRoom = async ({ state, effects }, values) => {
    state.loadingRooms = true
    state.RoomListArray.unshift(values)
    state.loadingRooms = false
}

export const createOrg = async ({ state, effects }, values) => {

}
export const setActiveWinInfo = async ({ state, effect }, values) => {
    state.activeWindowApp = values
}