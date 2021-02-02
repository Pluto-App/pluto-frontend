export const state = {
    teamowner: "",
    signedUp: false,
    loggedIn: false,
    addingTeam: false,
    loginStarted: false,
    loadingTeams: true,
    loadingMembers: true,
    userTeamDataInfo: {},
    activeTeamId: 0,
    activeRoomId: 0,
    activeRoomName: "",
    RoomListArray: [],
    userMapping: {},
    teamMemberList: [],
    
    // App Settings
    

    // App State
    online: true,
    teamUpdateReq: true,
    addingRoom: false,
    loadingTeam: false,
    error: {},
    noTeam: false,

    // Video Call
    streamingScreenShare: false,
    videoCallCompactMode: true,

    // App Data
    activeWindowApp: {},
    loggedInUser: {},
    userProfileData: {},
    userData: {teams: []},
    currentTeam: {rooms: [], users: []},
    onlineUsers: {},
    usersActiveWindows: {},
    screenShareViewers: {},
    screenShareCursors: {},
    screenSize: {},

    usersInRoom: {},

}