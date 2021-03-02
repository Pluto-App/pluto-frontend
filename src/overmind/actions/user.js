
import { socket_live, events } from '../../components/sockets'

export const getLoggedInUser = async ({state, actions, effects}, { authData, setAuthData, joinRooms, skipFetchTeam }) => {

  	state.loadingUser = true
    var userData = {}

  	try {

  		userData = await effects.user.getUser(authData, authData.user.id); 
      
      if(userData.id){
        actions.userpreference.getUserPreference({ authData: authData});

        socket_live.emit('join_room', userData.uid);

        state.userProfileData = userData;

        if(!skipFetchTeam && userData.teamIds){
          if(userData.teamIds.length === 0){
            state.noTeams = true;  
          } else {
            state.noTeams = false;

            var teamId;
            if(state.currentTeam && state.currentTeam.id && userData.teamIds.includes(state.currentTeam.id)){
              teamId = state.currentTeam.id
            } else {
              teamId = userData.teamIds[0];
            }

            actions.team.getTeam({authData: authData, team_id: teamId})
          }
        }

        if(joinRooms && userData.teams){
          for(var team of userData.teams){
            socket_live.emit(events.joinRoom, { room: 't-' + team.tid, user_id: userData.id})
          }
        }  
      } else {

        if(setAuthData) {
          actions.auth.logOut({setAuthData: setAuthData}).then(() => {
              window.require("electron").ipcRenderer.send('logout');
          });  
        }
      }
      
	  	state.loadingUser = false

  	} catch (error) {

  		state.error = error;
  	}

    return userData;
}

export const getUser = async ({state, effects, actions}, {authData, user_id}) => {
  return await effects.user.getUser(authData, user_id); 
}

export const registerUser = async ({state, effects, actions}, {userData}) => {

  var responseData = await effects.user.registerUser(userData);
  return responseData;
}

export const resendLoginCode = async ({state, effects, actions}, {userData}) => {

  var responseData = await effects.user.resendLoginCode(userData);
  return responseData;
}


export const updateUser = async ({state, effects, actions}, {authData, userData}) => {

    var resonseData = await effects.user.updateUser(authData, userData)
    state.userProfileData.name = resonseData.name;

    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser.user = resonseData;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

export const getTeamMembers = async ({state, actions, effects}, {authData, teamId}) => {

    state.loadingUser = true
    var teamMembers = []

    try {

      teamMembers = await effects.user.getTeamMembers(authData, teamId)
      
      if(teamMembers){
        state.teamMembers = teamMembers;

        for(var member of teamMembers){
          state.onlineUsers[member.id] = member.online;
          state.teamMembersMap[member.id] = member;
        }
      }
      
    } catch (error) {

      state.error = error;
    }

    return teamMembers;
}
