export const state = {

    change : {}, 
    signedIn : false,
    loggedIn : false, 
    addingTeam : false,
    loginStarted : false,
    loadingHome : true,
    loadingMembers : true,
    userProfileData : {},
    memberList : {},

    getTeamsUrl : 'https://pluto-office.herokuapp.com/teamsbyuserid',
    getTeamMembersUrl : 'https://pluto-office.herokuapp.com/usersbyteamid',
    loginUrl : 'https://pluto-office.herokuapp.com/login', 
    createTeamUrl : 'https://pluto-office.herokuapp.com/addteam',
    
    activeTeamId : 0, 
    teamDataInfo : {}
  }