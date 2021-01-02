
export const getTeam = async ({state, effects}, {authData, team_id}) => {

	state.loadingTeam = true

	var teamData = await effects.team.getTeam(authData, team_id)
	state.currentTeam = teamData;
	
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

export const updateCurrentTeam = async ({state, effects}, {team_id}) => {

  	state.loadingTeam = true;
  	state.currentTeamId = team_id;
  	state.loadingTeam = false;
}