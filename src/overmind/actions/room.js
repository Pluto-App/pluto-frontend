
export const addRoom = async ({state, effects}, {authData, roomData}) => {

  	state.addingRoom = true
  	var roomData = await effects.room.addRoom(authData, roomData)
  	state.addingRoom = false
}

export const deleteRoom = async ({state, effects}, {authData, roomData}) => {

  	state.deletingRoom = true
  	var roomData = await effects.room.deleteRoom(authData, roomData)
  	state.deletingRoom = false
}

export const getUsersInRoom = async ({state, effects}, {authData, roomId}) => {

  	var roomUsers = await effects.room.getUsersInRoom(authData, roomId)
  	state.usersInRoom[roomId] = roomUsers;
}