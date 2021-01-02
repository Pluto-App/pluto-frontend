export const state = {
    teamowner: "",
    signedUp: false,
    loggedIn: false,
    addingTeam: false,
    loginStarted: false,
    loadingTeams: true,
    loadingMembers: true,
    userProfileData: {},
    userTeamDataInfo: {},
    activeTeamId: 0,
    activeRoomId: 0,
    activeRoomName: "",
    RoomListArray: [],
    userMapping: {},
    teamMemberList: [],
    
    // App Settings
    

    // App State
    teamUpdateReq: true,
    addingRoom: false,
    loadingTeam: false,

    // App Data
    activeWindowApp: {},
    userData: {teams: []},
    currentTeam: {rooms: [], users: []}
}