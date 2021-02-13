
import { socket_live, events } from '../../components/sockets'

export const getLoggedInUser = async ({state, actions, effects}, {authData: authData, params: params}) => {

  	state.loadingUser = true
    var userData = {}

  	try {

  		userData = await effects.user.getUser(authData, params)
      actions.userpreference.getUserPreference({ authData: authData});

	  	socket_live.emit('join_room', userData.uid);

		  state.userProfileData = userData;

      if(userData.teamIds && userData.teamIds.length == 0)
        state.noTeams = true;
      else
        state.noTeams = false;

		  state.currentTeamId = userData.teamIds[0];
	  	state.loadingUser = false

  	} catch (error) {

  		state.error = error;
  	}

    return userData;
}

export const updateUser = async ({state, effects, actions}, {authData, userData}) => {

    var userData = await effects.user.updateUser(authData, userData)
    state.userProfileData.name = userData.name;

    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser.user = userData;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}
