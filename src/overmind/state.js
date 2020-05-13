export const state = {
    change: {},
    signedIn: false,
    loggedIn: false,
    addingTeam: false,
    loginStarted: false,
    loadingTeams: true,
    loadingMembers: true,
    userProfileData: {}, 
    teamDataInfo: {}, // Use ES6 MAP /SET
    activeTeamId: 0,
    activeRoomId: 0,
    activeRoomName: "",
    memberList: [],  // Use ES6 MAP /SET
    activeMemberId: '',
    loggedInUserId: '',
    RoomListArray: []
}