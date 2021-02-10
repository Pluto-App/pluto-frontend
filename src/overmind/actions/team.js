
import { socket_live, events } from '../../components/sockets'

export const getTeam = async ({state, effects}, {authData, team_id}) => {

	state.loadingTeam = true

	var teamData = await effects.team.getTeam(authData, team_id)
	state.currentTeam = teamData;
  console.log('setting currentTeam');
  console.log(state.currentTeam);

  var onlineUsers = await effects.user.getOnlineUsers(authData, teamData.tid);
  
  if(onlineUsers){
     for(var user_id of onlineUsers){
      state.onlineUsers[user_id] = true;
    }   
  }

  localStorage.setItem('current_team',state.currentTeam.tid);
  localStorage.setItem('current_team_id',state.currentTeam.id);
  socket_live.emit(events.joinRoom, { room: state.currentTeam.tid, user_id: state.userProfileData.id});

	state.loadingTeam = false
  state.teamUpdateReq = false
}

export const createTeam = async ({state, effects}, {authData, teamData}) => {

  // These states don't really do anything for now: Jan 2nd
	state.addingTeam = true
	var teamData = await effects.team.createTeam(authData, teamData)
	state.addingTeam = false
}

export const deleteTeam = async ({state, effects}, {authData, teamData}) => {

  // These states don't really do anything for now: Jan 2nd
  state.deletingTeam = true;
  var teamData = await effects.team.deleteTeam(authData, teamData);
  state.currentTeamId = null;
  state.deletingTeam = false;
}

export const removeUser = async ({state, effects}, {authData, reqData}) => {

    var teamData = await effects.team.removeUser(authData, reqData);
    state.teamUpdateReq = true
}

export const addUser = async ({state, effects}, {authData, reqData}) => {

    state.loadingTeam = true;
    var teamData = await effects.team.addUser(authData, reqData);
    state.noTeams = false;
    state.loadingTeam = false;
}

export const updateCurrentTeam = async ({state, effects}, {team_id}) => {

  	state.loadingTeam = true;
  	state.currentTeamId = team_id;
  	state.loadingTeam = false;
}