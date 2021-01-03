
export const getLoggedInUser = async ({state, effects}, {authData: authData, params: params}) => {

  	state.loadingUser = true
  	var userData = await effects.user.getUser(authData, params)

	state.userProfileData = userData;

	state.currentTeamId = userData.teamIds[0];
  	state.loadingUser = false
}