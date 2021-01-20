
import { socket_live, events } from '../../components/sockets'
import * as md5 from "md5";
import * as Cookies from "js-cookie";

import { toast } from 'react-toastify';
import ToastNotification from '../../components/widgets/ToastNotification'

export const setLoggedInUser = async ({ state, effect }) => {

	state.loggedInUser = JSON.parse(localStorage.getItem('currentUser')).user
}


export const setActiveWinInfo = async ({ state, effect }, activeWindowApp) => {
	
    state.activeWindowApp = activeWindowApp;
	socket_live.emit(events.activeWindowUpdate, {user_id: state.userProfileData.id, active_window_data: activeWindowApp});
}

export const setAddingRoom = async ({ state, effect }, value) => {
	    
    state.addingRoom = value;
}

export const addOnlineUser = async ({ state, effect }, user_id) => {
	    
    if(state.onlineUsers.indexOf(user_id) === -1)
    	state.onlineUsers.push(user_id)
}

export const removeOnlineUser = async ({ state, effect }, user_id) => {
	    
    if(state.onlineUsers.indexOf(user_id) != -1)
    	state.onlineUsers.splice(state.onlineUsers.indexOf(user_id),1)
}


export const updateUserActiveWindowData = async ({ state, effect }, {user_id, active_window_data}) => {

	state.usersActiveWindows[user_id] = active_window_data;

	// HACK to pass data to other electron windows.
	localStorage.setItem('usersActiveWindows', JSON.stringify(state.usersActiveWindows));
}

export const setElectronWindowActiveWinInfo = async ({ state, effect }, usersActiveWindows) => {

	state.usersActiveWindows = usersActiveWindows;
}

export const setElectronWindowScreenShareViewers = async ({ state, effect }, screenShareViewers) => {

	state.screenShareViewers = screenShareViewers;
}

export const setElectronWindowScreenShareCursors = async ({ state, effect }, screenShareCursors) => {

	state.screenShareCursors = screenShareCursors;
}

export const userVideoCall = async ({ state, effect }, data) => {

 	localStorage.setItem("call_channel_id", data.channel_id);
 	socket_live.emit('join_room', data.channel_id);

    window.require("electron").ipcRenderer.send('load-video-window', data.channel_id);

    ToastNotification('success', `Incoming VC`);
}

export const userScreenShare = async ({ state, effect }, data) => {

	if(data.sender_id == state.userProfileData.uid){
	 	localStorage.setItem("screenshare_channel_id", data.channel_id);
	 	localStorage.setItem("screenshare_resolution", JSON.stringify(data.resolution));

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

	if(data.event.type == 'click')
		window.require("electron").ipcRenderer.send('emit-click', data);
	else if(data.event.type == 'keyup')
		window.require("electron").ipcRenderer.send('emit-keypress', data);

	// HACK to pass data to other electron windows.
	localStorage.setItem('screenShareCursors', JSON.stringify(state.screenShareCursors));
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

export const clearVideoCallData = async ({ state, effect }) => {

	clearScreenShareData();
	localStorage.removeItem('call_channel_id');
}

export const clearScreenShareData = async ({ state, effect }) => {

	localStorage.removeItem('attendeeMode');
	localStorage.removeItem('screenshare_channel_id');
	localStorage.removeItem('screenShareViewers');
}

