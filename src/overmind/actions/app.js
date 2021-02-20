
import { socket_live, events } from '../../components/sockets'
import * as md5 from "md5";
import * as Cookies from "js-cookie";

import { toast } from 'react-toastify';
import ToastNotification from '../../components/widgets/ToastNotification'

export const setLoggedInUser = async ({ state, effect }) => {

	state.loggedInUser = JSON.parse(localStorage.getItem('currentUser')).user
}

export const setVideoCallCompactMode = async ({ state, effect }, mode) => {
	
    state.videoCallCompactMode = mode;
}

export const setActiveWinInfo = async ({ state, effect }, activeWindowApp) => {
	
    state.activeWindowApp = activeWindowApp;
	socket_live.emit(events.activeWindowUpdate, {user_id: state.userProfileData.id, active_window_data: activeWindowApp});
}

export const setAddingRoom = async ({ state, effect }, value) => {
	    
    state.addingRoom = value;
}

export const updateUserActiveWindowData = async ({ state, effect }, {user_id, active_window_data}) => {

	state.usersActiveWindows[user_id] = active_window_data;
}

// ToDo: This is not NEEDED!
// This can be fixed by listening to right room on socket in ScreenShareContainer
// 
export const setElectronWindowScreenShareViewers = async ({ state, effect }, screenShareViewers) => {

	state.screenShareViewers = screenShareViewers;
}

export const userVideoCall = async ({ state, effect }, data) => {

	if(localStorage.getItem("call_channel_id") && localStorage.getItem("call_channel_id") == data.channel_id){
		// Do nothing
	} else {
		localStorage.setItem("call_channel_id", data.channel_id);
	 	socket_live.emit(events.joinRoom, data.channel_id);

	    window.require("electron").ipcRenderer.send('init-video-call-window', data.channel_id);	
	}
 	
    ToastNotification('success', `Incoming VC`);
}

export const userScreenShare = async ({ state, effect }, data) => {

	if(data.sender_id != state.userProfileData.uid){
	 	localStorage.setItem("screenshare_channel_id", data.channel_id);
	 	localStorage.setItem("screenshare_resolution", JSON.stringify(data.resolution));
	 	localStorage.setItem("screenshare_owner", data.sender_id);

	 	state.streamingScreenShare = true;
	 	window.require("electron").ipcRenderer.send('stream-screenshare', data.channel_id);	
	}
}

export const updateScreenShareViewers = async ({ state, effect }, data) => {

	if(data.user)
		state.screenShareViewers[data.user.uid] = data.user;

	// HACK to pass data to other electron windows.
	localStorage.setItem('screenShareViewers', JSON.stringify(state.screenShareViewers));
}

export const updateScreenShareCursor = async ({ state, effect }, data) => {

	if(data.user)
		state.screenShareCursors[data.user.id] = data.cursor;

	var remoteAccessEnabled = localStorage.getItem('remoteAccessEnabled');
	if(remoteAccessEnabled && remoteAccessEnabled == 'true'){

		if(data.event.type == 'click')
			window.require("electron").ipcRenderer.send('emit-click', data);
		
		else if(data.event.type == 'wheel')
			window.require("electron").ipcRenderer.send('emit-scroll', data);

		else if(data.event.type == 'mousedown')
			window.require("electron").ipcRenderer.send('emit-mousedown', data);

		else if(data.event.type == 'mouseup')
			window.require("electron").ipcRenderer.send('emit-mouseup', data);

		else if(data.event.type == 'keyup' || data.event.type == 'keydown')
			window.require("electron").ipcRenderer.send('emit-key', data);
	}
}

export const setScreenSize = async ({ state, effect }) => {

	state.screenSize = await window.require("electron").ipcRenderer.sendSync('screen-size');
}

export const setAppOnlineStatus = async ({ state, effect }, status) => {
	state.online = status;
}

export const clearNotifications = async ({ state, effect }) => {
	toast.dismiss();
}

export const setError = async ({ state, effect }, error) => {

	if(error.message != state.error.message)
		state.error = error
}

export const setUserOnline = async ({ state, effect }, user_id) => {
	
	state.teamMembersMap[user_id].online = true;
}

export const setUserOffline = async ({ state, effect }, user_id) => {

	state.teamMembersMap[user_id].online = false;
}

export const emitUpdateTeam = async ({ actions, state, effect }) => {

	for( var team of state.userProfileData.teams){
		socket_live.emit(events.updateTeam, 
			{ 
				tid: team.tid
			}
		);	
	}
}

export const emitUpdateTeamRooms = async ({ actions, state, effect }) => {

	for( var team of state.userProfileData.teams){
		socket_live.emit(events.updateTeam, 
			{ 
				tid: team.tid
			}
		);	
	}
}

export const emitUpdateTeamMembers = async ({ actions, state, effect }) => {

	for( var team of state.userProfileData.teams){
		socket_live.emit(events.updateTeam, 
			{ 
				tid: team.tid
			}
		);	
	}
}

export const clearVideoCallData = async ({ actions, state, effect }) => {

	var call_channel_id = localStorage.getItem('call_channel_id');
	var curent_team = localStorage.getItem('current_team');

	socket_live.emit(events.exitRoomVideoCall, 
		{ 
			tid: 		curent_team,
			rid: 		call_channel_id.split('-')[1], 
			uid: 		state.userProfileData.uid ,
			channel_id: call_channel_id
		},
		(data) => {
			actions.app.emitUpdateTeam();
		}
	);
	
	deleteScreenShareData();
	localStorage.removeItem('call_channel_id');
}

export const clearScreenShareData = async ({ state, effect }) => {

	deleteScreenShareData();
}

const deleteScreenShareData = () => {

	localStorage.removeItem('attendeeMode');
	localStorage.removeItem('screenshare_channel_id');
	localStorage.removeItem('screenshare_owner');
	localStorage.removeItem('screenshare_source');
	localStorage.removeItem('screenshare_resolution');
	localStorage.removeItem('screenShareViewers');
	localStorage.removeItem('screenShareCursors');
	localStorage.removeItem('remoteAccessEnabled');
}
