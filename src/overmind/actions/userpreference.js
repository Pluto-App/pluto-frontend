
import { socket_live, events } from '../../components/sockets'

export const getUserPreference = async ({state, effects}, {authData}) => {

	var userPreference = await effects.userpreference.getUserPreference(authData, authData.user.id)
	
	if(userPreference && userPreference.user_id){	
		state.userPreference = userPreference;
		localStorage.setItem('userPreference', JSON.stringify(userPreference));
	} else {
		localStorage.removeItem('userPreference');
	}
}

export const createUserPreference = async ({state, effects}, {authData, userPreferenceData}) => {

	var userPreference = await effects.userpreference.createUserPreference(authData, userPreferenceData)

	if(userPreference && userPreference.user_id){

		localStorage.setItem('userPreference', JSON.stringify(userPreference));
		state.userPreference = userPreference;	
	}
}

export const updateUserPreference = async ({state, effects}, {authData, userPreferenceData}) => {

	var responseData = await effects.userpreference.updateUserPreference(authData, userPreferenceData);
}
