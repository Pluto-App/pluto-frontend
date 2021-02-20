
import { socket_live, events } from '../../components/sockets'

export const getTeam = async ({state, actions, effects}, {authData, team_id}) => {

	state.loadingTeam = true

	var teamData = await effects.team.getTeam(authData, team_id || state.currentTeam.id)

  if(teamData.id){
    
    state.currentTeam = teamData;
    
    actions.room.getTeamRooms({ authData: authData, teamId: teamData.id});
    actions.user.getTeamMembers({ authData: authData, teamId: teamData.id});

    localStorage.setItem('current_team',state.currentTeam.tid);
    localStorage.setItem('current_team_id',state.currentTeam.id);
    socket_live.emit(events.joinRoom, { room: 't-' + state.currentTeam.tid, user_id: state.userProfileData.id});
  }
	
	state.loadingTeam = false
  state.teamUpdateReq = false

  return teamData;
}

export const createTeam = async ({state, effects}, {authData, teamData}) => {

  // These states don't really do anything for now: Jan 2nd
	state.addingTeam = true
	var teamData = await effects.team.createTeam(authData, teamData)
	state.addingTeam = false

  return teamData;
}

export const updateTeam = async ({state, effects}, {authData, teamData}) => {

   return await effects.team.updateTeam(authData, teamData)
}


export const deleteTeam = async ({state, effects}, {authData, teamData}) => {

  // These states don't really do anything for now: Jan 2nd
  state.deletingTeam = true;
  var teamData = await effects.team.deleteTeam(authData, teamData);
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

