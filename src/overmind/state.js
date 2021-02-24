import { derived } from 'overmind'

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
    screenShareUser: {},
    videoCallCompactMode: true,

    // App Data
    teamRooms: [],
    teamMembers: [],
    teamMembersMap: {},
    onlineUsers: {},
    userTeams: [],
    currentTeam: {},

    activeWindowApp: {},
    userPreference: {
        show_active_app: true,
        share_active_app: true
    },
    loggedInUser: {},
    userProfileData: {},
    usersActiveWindows: {},
    screenShareViewers: {},
    screenShareCursors: {},
    screenSize: {}
}