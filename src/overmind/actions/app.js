
import { socket_live, events } from '../../components/sockets'

export const setActiveWinInfo = async ({ state, effect }, {data}) => {
	    
    state.activeWindowApp = data;
	socket_live.emit(events.activeWindowUpdate, {user_id: state.userProfileData.id, active_window_data: data});
}

export const setAddingRoom = async ({ state, effect }, value) => {
	    
    state.addingRoom = value;
}

export const addOnlineUser = async ({ state, effect }, user_id) => {
	    
    if(state.onlineUsers.indexOf(user_id) === -1)
    	state.onlineUsers.push(user_id)
}

export const updateUserActiveWindowData = async ({ state, effect }, {user_id, active_window_data}) => {
	state.usersActiveWindows[user_id] = active_window_data;
}
          

