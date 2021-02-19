
export const addRoom = async ({state, effects, actions}, {authData, roomData}) => {

  	state.addingRoom = true
  	var roomData = await effects.room.addRoom(authData, roomData)
  	actions.team.getTeam({authData: authData, team_id: state.currentTeam.id})
    actions.app.emitUpdateTeamRooms();
  	state.addingRoom = false
}

export const updateRoom = async ({state, effects, actions}, {authData, roomData}) => {

  	var roomData = await effects.room.updateRoom(authData, roomData)
    actions.app.emitUpdateTeamRooms();
}

export const deleteRoom = async ({state, effects, actions}, {authData, roomData}) => {

  	state.deletingRoom = true
  	var roomData = await effects.room.deleteRoom(authData, roomData)
  	actions.team.getTeam({authData: authData, team_id: state.currentTeam.id})  
    actions.app.emitUpdateTeamRooms();
  	state.deletingRoom = false
}

export const getTeamRooms = async ({state, effects}, {authData, teamId}) => {

    var teamRooms = await effects.room.getTeamRooms(authData, teamId)
    state.teamRooms = teamRooms;
}