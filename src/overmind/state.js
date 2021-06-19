export const state = {
  teamowner: '',
  signedUp: false,
  loggedIn: false,
  addingTeam: false,
  loginStarted: false,
  loadingTeams: true,
  loadingMembers: true,
  userTeamDataInfo: {},
  activeTeamId: 0,
  activeRoomId: 0,
  activeRoomName: '',
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
  noTeams: false,

  // Video Call
  streamingScreenShare: false,
  sharingScreen: false,
  sharingWindow: false,
  screenShareUser: {},
  videoCallCompactMode: true,
  userColor: {},

  // App Data
  teamRooms: [],
  teamRoomsMap: {},
  teamMembers: [],
  teamMembersMap: {},
  onlineUsers: {},
  userTeams: [],
  currentTeam: {},

  activeWindowApp: {},
  userPreference: {
    show_active_app: true,
    share_active_app: true,
  },
  loggedInUser: {},
  userProfileData: {},
  usersActiveWindows: {},
  screenSize: {},
};
