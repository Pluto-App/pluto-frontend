
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