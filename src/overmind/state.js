export const state = {

    change : {}, 
    signedIn : false,
    loggedIn : false, 
    addingTeam : false,
    loginStarted : false,
    loadingHome : true,
    loadingMembers : true,
    userProfileData : {},
    teamDataInfo : {},
    activeTeamId : 0, 
    memberList : {},
    activeMemberId : '',
    loggedInUserId : '',

    getTeamsUrl : 'https://pluto-office.herokuapp.com/teams/teamsbyuserid',
    getTeamMembersUrl : 'https://pluto-office.herokuapp.com/users/usersbyteamid',
    loginUrl : 'https://pluto-office.herokuapp.com/users/login', 
    createTeamUrl : 'https://pluto-office.herokuapp.com/teams/addteam',

  }