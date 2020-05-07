export const state = {
    change: {},
    signedIn: false,
    loggedIn: false,
    addingTeam: false,
    loginStarted: false,
    loadingTeams: true,
    loadingMembers: true,
    userProfileData: {},
    teamDataInfo: {},
    activeTeamId: 0,
    activeRoomId: 0,
    memberList: [],
    activeMemberId: '',
    loggedInUserId: '',
    RoomListArray: [
        {
            id: 1,
            name: 'Coffee Room ☕'
        },
        {
            id: 2,
            name: 'Daily Standup 🚀'
        },
        {
            id: 3,
            name: 'Conference Room ⚙️'
        }
    ]
}