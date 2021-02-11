
export const addRoom = async ({state, effects, actions}, {authData, roomData}) => {

  	state.addingRoom = true
  	var roomData = await effects.room.addRoom(authData, roomData)
  	actions.team.getTeam({authData: authData, team_id: state.currentTeamId})    
  	state.addingRoom = false
}

export const updateRoom = async ({state, effects, actions}, {authData, roomData}) => {

  	var roomData = await effects.room.updateRoom(authData, roomData)
}

export const deleteRoom = async ({state, effects, actions}, {authData, roomData}) => {

  	state.deletingRoom = true
  	var roomData = await effects.room.deleteRoom(authData, roomData)
  	actions.team.getTeam({authData: authData, team_id: state.currentTeamId})  
  	state.deletingRoom = false
}

export const getUsersInRoom = async ({state, effects}, {authData, roomId}) => {

  	var roomUsers = await effects.room.getUsersInRoom(authData, roomId)
  	state.usersInRoom[roomId] = roomUsers;
}