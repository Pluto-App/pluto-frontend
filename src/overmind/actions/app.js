
import { socket_live, events } from '../../components/sockets'
import * as md5 from "md5";
import * as Cookies from "js-cookie";

import { toast } from 'react-toastify';
import ToastNotification from '../../components/widgets/ToastNotification'

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
}

export const userVideoCall = async ({ state, effect }, data) => {

	let id = md5(state.activeTeamId + state.userProfileData.userid);

 	Cookies.set("channel", id);
    window.require("electron").ipcRenderer.send('load-video-window', id);
    ToastNotification('success', `Incoming VC`);
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
