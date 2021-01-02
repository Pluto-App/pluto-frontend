
export const setActiveWinInfo = async ({ state, effect }, {data}) => {
	    
    state.activeWindowApp = data
}

export const setAddingRoom = async ({ state, effect }, value) => {
	    
    state.addingRoom = value;
}

