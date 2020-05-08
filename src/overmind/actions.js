import { googleSignIn } from '../auth/authhandle'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const options = {
    // onOpen: props => console.log(props.foo),
    // onClose: props => console.log(props.foo),
    autoClose: 1000,
    position: toast.POSITION.BOTTOM_RIGHT,
    pauseOnHover: true,
};

export const handleLogout = async ({ state }) => {
    state.loggedIn = false;
    toast.info("Logged Out", options)
}

export const googlehandleLogin = async ({ state, effects }) => {
    state.loginStarted = true;
    state.userProfileData = await googleSignIn()
    let dump = await effects.postHandler(process.env.REACT_APP_LOGIN_URL, state.userProfileData)
    state.userProfileData.addStatus = dump.addStatus
    state.loggedIn = true
    state.signedIn = true;
    state.loginStarted = false;
    state.change["teamowner"] = state.userProfileData.username
}

export const createTeam = async ({ state, effects }, values) => {

    state.addingTeam = true;
    let newTeamData = await effects.postHandler(process.env.REACT_APP_CREATE_TEAM_URL, values)
    state.addingTeam = false;

    if (newTeamData !== undefined && newTeamData.addStatus !== 0) {
        
        if (!state.userProfileData.addStatus && state.activeTeamId !== 0)
            state.teamDataInfo[state.activeTeamId].isActive = false
        
        state.activeTeamId = newTeamData.teamid
        state.teamDataInfo[newTeamData.teamid] = {
            teamid: newTeamData.teamid,
            teamowner: newTeamData.teamowner,
            teamname: newTeamData.teamname,
            teamownerid : newTeamData.teamownerid,
            avatar: newTeamData.avatar,
            magiclink: newTeamData.magiclink,
            isActive: true,
            plan: 'Regular'
        }
        toast.success("Team created", options)
    } else if (newTeamData.addStatus === 0) {
        toast.error("Team already exists", options)
    } else {
        toast.error("Team creation failed", options)
    }
}

export const teamsbyuserid = async ({ state, effects }, values) => {

    state.loadingTeams = true
    state.loadingRooms = true
    let dump = await effects.postHandler(process.env.REACT_APP_GET_TEAMS_URL, values)

    if (Array.isArray(dump.teams) && dump.teams.length) {
        dump.teams.map((t) => {
            state.teamDataInfo[t.teamid] = {
                teamid: t.teamid,
                teamowner: t.teamowner,
                teamname: t.teamname,
                teamownerid : t.teamownerid,
                avatar: t.avatar,
                magiclink: t.magiclink,
                isActive: false,
                plan: 'Regular'
            }
        })
        if (state.activeTeamId === 0) {
            state.activeTeamId = dump.teams[0].teamid
        }
        state.teamDataInfo[state.activeTeamId].isActive = true
    } else {
        state.loadingRooms = false
        state.loadingTeams = false
        state.loadingMembers = false
        state.teamDataInfo = {}
        toast.error("You don't belong to any team", options)
    }

    state.loadingRooms = false
    state.loadingTeams = false
}

export const usersbyteamid = async ({ state, effects }, values) => {

    state.loadingMembers = true
    let dump = await effects.postHandler(process.env.REACT_APP_GET_TEAM_MEMBERS_URL, values)

    state.memberList = []

    if (Array.isArray(dump.users) && dump.users.length) {
        dump.users.map((u) => {
            let userObj = {
                userid: u.id,
                username: u.username,
                usermail: u.email,
                avatar: u.avatar,
                statusColor: 'green' // How to update it via sockets?
            }
            state.memberList.push(userObj)
        })
    } else {
        toast.error("Could not load users", options)
        state.loadingMembers = false
    }

    state.loadingMembers = false
}

export const handleChangeMutations = async ({ state }, values) => {
    state.change[values.target] = values.value
}

export const changeActiveTeam = async ({ state }, values) => {
    state.teamDataInfo[state.activeTeamId].isActive = false
    state.activeTeamId = values
    state.teamDataInfo[values].isActive = true
}

export const setOwnerName = async ({ state }, values) => {
    state.change[values.target] = values.value
}

export const addNewRoom = ({ state }, values) => {
    // REACT_APP_ADD_ROOM_TO_TEAM
    state.loadingRooms = true
    state.RoomListArray.unshift(values)
    state.loadingRooms = false
    // TODO Remove room from backend by activeTeamId and values. 
}

export const removeRoom = async ({ state }, values) => {
    // REACT_APP_DELETE_ROOM_FROM_TEAM
    state.loadingRooms = true
    let arr = await state.RoomListArray.filter((rooms) => {
        return rooms.id !== values
    })
    state.RoomListArray = arr
    state.loadingRooms = false
    // TODO Remove room from backend by activeTeamId and values. 
}

export const removeTeamMember = async ({ state, effects }, values) => {
    state.loadingMembers = true;
    let arr = state.memberList.filter((member) => {
        return member.userid !== values.userid
    })
    await effects.postHandler(process.env.REACT_APP_DELETE_USER_FROM_TEAM, values)
    state.memberList = arr
    state.loadingMembers = false;
}

export const roomsbyteamid = async ({ state, effects }, values) => {
    // Passed Team Id.
    // REACT_APP_GET_ROOMS_FROM_ID
}

export const getOnlineMembersList = async ({ state, effects }, value) => {
    // Online members List.
    // REACT_APP_LIVE_ENDPOINT
}