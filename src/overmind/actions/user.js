
import { socket_live, events } from '../../components/sockets'

export const getLoggedInUser = async ({state, effects}, {authData: authData, params: params}) => {

  	state.loadingUser = true
  	var userData = await effects.user.getUser(authData, params)

  	socket_live.emit('join_room', userData.uid);

	state.userProfileData = userData;

	state.currentTeamId = userData.teamIds[0];
  	state.loadingUser = false
}