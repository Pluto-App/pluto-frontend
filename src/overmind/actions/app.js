
import { socket_live, events } from '../../components/sockets'

import { toast } from 'react-toastify';
import ToastNotification from '../../components/widgets/ToastNotification'

const { ipcRenderer } = window.require("electron");

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

export const setUserInCall = async ({ state, effect }, user_id) => {
	
	if(state.teamMembersMap[user_id])
    	state.teamMembersMap[user_id].in_call = true;
}

export const unsetUserInCall = async ({ state, effect }, user_id) => {
	
	if(state.teamMembersMap[user_id]){
    	state.teamMembersMap[user_id].in_call = false;
	}
}

export const setUserInRoom = async ({ state, effect }, {room_id, user_uid}) => {

	if(state.teamRoomsMap[room_id] && !(state.teamRoomsMap[room_id].users || []).includes(user_uid))  {
		if(!state.teamRoomsMap[room_id].users)
			state.teamRoomsMap[room_id].users = [];

    	state.teamRoomsMap[room_id].users.push(user_uid);
	}
}

export const unsetUserInRoom = async ({ state, effect }, {room_id, user_uid}) => {

	if(state.teamRoomsMap[room_id] && state.teamRoomsMap[room_id].users){
		var index = state.teamRoomsMap[room_id].users.indexOf(user_uid);
		if (index > -1) {
		  state.teamRoomsMap[room_id].users.splice(index, 1);
		}
	}
}

export const updateUserActiveWindowData = async ({ state, effect }, {user_id, active_window_data}) => {
	state.usersActiveWindows[user_id] = active_window_data;
}

export const setElectronScreenShareViewers = async ({ state, effect }, screenShareViewers) => {

	state.screenShareViewers = screenShareViewers;
}

export const userVideoCall = async ({ state, effect }, data) => {
		
	if(localStorage.getItem("call_channel_id") && localStorage.getItem("call_channel_id") === data.call_channel_id){

	} else {
		
		var call_data = {
			call_channel_id: data.call_channel_id
		};

		localStorage.setItem('call_channel_id', data.call_channel_id);
    	localStorage.setItem('call_data', JSON.stringify(call_data));

	 	socket_live.emit(events.joinRoom, data.call_channel_id);

	 	ipcRenderer.send('set-call-data', {call_data: call_data});
	    ipcRenderer.send('init-video-call-window', {call_data: call_data, call_channel_id: data.call_channel_id});	
	}
 	
    ToastNotification('success', `Incoming VC`);
}

export const userScreenShare = async ({ state, effect }, data) => {

	state.screenShareUser = data.user;
	if(data.sender_id !== state.userProfileData.uid){

	 	localStorage.setItem("screenshare_channel_id", data.channel_id);
	 	localStorage.setItem("screenshare_resolution", JSON.stringify(data.resolution));
	 	localStorage.setItem("screenshare_owner", data.sender_id);

	 	state.streamingScreenShare = true;

		if(state.sharingScreen){
			ipcRenderer.send('stop-screenshare');
		}
	}
}

export const userWindowShare = async ({ state, effect }, data) => {

	if(data.user_uid !== state.userProfileData.uid){

		var windowshare_resolutions = JSON.parse(localStorage.getItem('windowshare_resolutions')) || {};
		windowshare_resolutions[data.user_uid] = data.resolution;

		localStorage.setItem("windowshare_resolutions", JSON.stringify(windowshare_resolutions));

	 	state.streamingWindowShare = true;
	 	ipcRenderer.send('streaming-windowshare', data);
	}
}

export const setSharingScreen = async ({ state, effect }, value) => {
 	state.sharingScreen = value;
}

export const setSharingWindow = async ({ state, effect }, value) => {
 	state.sharingWindow = value;
}

export const setStreamingScreenShare = async ({ state, effect }, value) => {
 	state.streamingScreenShare = value;
}

export const setStreamingWindowShare = async ({ state, effect }, value) => {
 	state.streamingWindowShare = value;
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
	if(remoteAccessEnabled && remoteAccessEnabled === 'true'){

		if(data.event.type === 'click'){
			if(data.event.witch === 3)
				ipcRenderer.send('emit-right-click', data);
			else
				ipcRenderer.send('emit-click', data);
		}
		
		else if(data.event.type === 'wheel')
			ipcRenderer.send('emit-scroll', data);

		else if(data.event.type === 'mousedown')
			ipcRenderer.send('emit-mousedown', data);

		else if(data.event.type === 'mouseup')
			ipcRenderer.send('emit-mouseup', data);

		else if(data.event.type === 'keyup' || data.event.type === 'keydown')
			ipcRenderer.send('emit-key', data);
	}
}

export const updateWindowShareCursor = async ({ state, effect }, {channel_id, data}) => {

	data.container = 'window';

	if(data.event.type === 'wheel')
		ipcRenderer.send('emit-scroll', data);

	else if(data.event.type === 'mousedown')
		ipcRenderer.send('emit-mousedown', data);

	else if(data.event.type === 'mouseup')
		ipcRenderer.send('emit-mouseup', data);

	else if(data.event.type === 'keyup' || data.event.type === 'keydown')
		ipcRenderer.send('emit-key', data);
}

export const setScreenSize = async ({ state, effect }) => {

	state.screenSize = await ipcRenderer.sendSync('screen-size');
}

export const setAppOnlineStatus = async ({ state, effect }, status) => {
	state.online = status;
}

export const clearNotifications = async ({ state, effect }) => {
	toast.dismiss();
}

export const setError = async ({ state, effect }, error) => {

	if(error.message !== state.error.message)
		state.error = error
}

export const setUserOnline = async ({ state, effect }, user_id) => {
	
	state.teamMembersMap[user_id].online = true;
}

export const setUserOffline = async ({ state, effect }, user_id) => {

	state.teamMembersMap[user_id].online = false;
}

export const emitUpdateTeam = async ({ actions, state, effect }) => {

	for( var team of state.userProfileData.teams || [] ){
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

export const clearVideoCallData = async ({ actions, state, effect }, {call_channel_id}) => {

	localStorage.removeItem('call_channel_id');
	var curent_team = localStorage.getItem('current_team');
	var rid = call_channel_id.split('-')[1];

	const room_id = state.teamRooms.find(room => room.rid === rid);
	
	socket_live.emit(events.exitRoomVideoCall, 
		{ 
			tid: 		curent_team,
			rid: 		rid, 
			uid: 		state.userProfileData.uid ,
			teams: 		state.userProfileData.teams,
			channel_id: call_channel_id
		}
	);
	
	deleteScreenShareData();
	deleteWindowShareData();
}

export const clearScreenShareData = async ({ state, effect }) => {
	state.screenShareViewers = {};
	state.streamingScreenShare = false;
	state.screenShareUser = {};
	deleteScreenShareData();
}

const deleteScreenShareData = () => {

	localStorage.removeItem('call_data');
	localStorage.removeItem('attendeeMode');
	localStorage.removeItem('screenshare_channel_id');
	localStorage.removeItem('screenshare_owner');
	localStorage.removeItem('screenshare_source');
	localStorage.removeItem('screenshare_resolution');
	localStorage.removeItem('screenShareViewers');
	localStorage.removeItem('screenShareCursors');
	localStorage.removeItem('remoteAccessEnabled');
}

const deleteWindowShareData = () => {

	socket_live.emit(events.endWindowShare, 
		{ 
			channel_id: localStorage.getItem('windowshare_channel_id')
		}
	);

	localStorage.removeItem('windowshare_sources');
	localStorage.removeItem('windowshare_resolution');
}
