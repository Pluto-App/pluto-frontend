export const state = {

    change : {}, 
    signedIn : false,
    loggedIn : false, 
    addingTeam : false,
    loginStarted : false,
    userProfileData : {},

    getTeamsUrl : 'https://pluto-office.herokuapp.com/teamsbyuserid',
    getTeamMembersUrl : 'https://pluto-office.herokuapp.com/usersbyteamid',
    loginUrl : 'https://pluto-office.herokuapp.com/login', 
    createTeamUrl : 'https://pluto-office.herokuapp.com/addteam',
    
    activeTeamId : 1, 
    teamDataInfo : {
      1 : {
        teamid : 1,
        teamowner : 'Dummy Owner',
        teamname : 'Dummy Team', 
        avatar : 'https://api.adorable.io/avatars/285/abott@adorable1.png',
        magiclink : 'okn7843j7rddy', 
        isActive : true,
        plan : 'Regular'
      }
    }

  }