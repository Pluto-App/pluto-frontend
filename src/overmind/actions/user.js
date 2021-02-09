
import { socket_live, events } from '../../components/sockets'

export const getLoggedInUser = async ({state, effects}, {authData: authData, params: params}) => {

  	state.loadingUser = true

  	try {

  		var userData = await effects.user.getUser(authData, params)

	  	socket_live.emit('join_room', userData.uid);

		  state.userProfileData = userData;

      if(userData.teamIds.length == 0)
        state.noTeams = true;
      else
        state.noTeams = false;

		  state.currentTeamId = userData.teamIds[0];
	  	state.loadingUser = false

  	} catch (error) {

  		state.error = error;
  	}
}

export const updateUser = async ({state, effects, actions}, {authData, userData}) => {

    var userData = await effects.user.updateUser(authData, userData)
    state.userProfileData.name = userData.name;

    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser.user = userData;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}
