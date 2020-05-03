export const state = {
    change : {}, 
    signedIn : false,
    loggedIn : false, 
    addingTeam : false,
    loginStarted : false,
    getTeamsUrl : 'https://pluto-office.herokuapp.com/teamsbyuserid',
    getTeamMembersUrl : 'https://pluto-office.herokuapp.com/usersbyteamid',
    loginUrl : 'https://pluto-office.herokuapp.com/login', 
    createTeamUrl : 'https://pluto-office.herokuapp.com/addteam',
    userProfileData : {},
    newTeamData : {},
    activeTeamId : 84, // team currently active in user scope
    teamDataInfo : {
      84 : {
        id : 84,
        isActive : true,
        owner : 'Sumit Lahiri',
        name : 'Backend Eng', 
        plan : 'Regular',
        avatarUrlId : 765,
        members : [],
      },
      52 : {
        id : 52,
        isActive : false,
        owner : 'Sumit Lahiri',
        name : 'FrontEnd Eng', 
        plan : 'Regular',
        avatarUrlId : 762,
        members : [],
      }, 
      965 : {
        id : 965,
        isActive : false,
        owner : 'Puneet Acharya',
        name : 'Bussiness', 
        plan : 'Regular',
        avatarUrlId : 341,
        members : [],
      }, 
      235 : {
        id : 235,
        isActive : false,
        owner : 'Abhishek Wani',
        name : 'Operations', 
        plan : 'Regular',
        avatarUrlId : 435,
        members : [],
      }, 
      41 : {
        id : 41,
        isActive : false,
        owner : 'Abhishek Wani',
        name : 'Data Science', 
        plan : 'Premium',
        avatarUrlId : 745,
        members : [],
      }, 
      87 : {
        id : 87,
        isActive : false,
        owner : 'Alex Malinao',
        name : 'Supply Chain', 
        plan : 'Premium',
        avatarUrlId : 681,
        members : [],
      }
    },
  }