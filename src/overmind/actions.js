import { googleSignIn } from '../auth/authhandle'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const options = {
    // onOpen: props => console.log(props.foo),
    // onClose: props => console.log(props.foo),
    autoClose: 2000,
    position: toast.POSITION.BOTTOM_RIGHT,
    pauseOnHover: true,
};

export const randomStringGen = async ({ state, effects }, values) => {

    let result = ""
    let randomString = "7912ecbcffc48d2ded669cnxmkslhfyqowpslmvbvz3c0be25a2adc2e36a246947597257b3c43fc2e2d4c72c80be25a2adc2e36ayshgfbdpl987jhdt3refwvsbvcnxmkslhfyqowpslmvbvzdaf1639djs6sh"

    for (var i = 0; i < randomString.length; i += 1) {
        result += randomString.charAt(Math.floor(Math.random() * values));
    }

    return result
}

export const handleLogout = async ({ state }) => {
    state.loggedIn = false;
    toast.info("Logged Out", options)
}

export const googlehandleLogin = async ({ state, effects }) => {
    state.loginStarted = true;
    state.userProfileData = await googleSignIn()
    await effects.postHandler(process.env.REACT_APP_loginUrl, state.userProfileData)
    state.loggedIn = true
    state.signedIn = true;
    state.loginStarted = false;
    state.change["teamowner"] = state.userProfileData.username
}

export const createTeam = async ({ state, effects }, values) => {

    state.addingTeam = true;
    let newTeamData = await effects.postHandler(process.env.REACT_APP_createTeamUrl, values)
    state.addingTeam = false;

    state.teamDataInfo[state.activeTeamId].isActive = false

    if (newTeamData !== undefined) {
        state.activeTeamId = newTeamData.teamid
        state.teamDataInfo[newTeamData.teamid] = {
            teamid: newTeamData.teamid,
            teamowner: newTeamData.teamowner,
            teamname: newTeamData.teamname,
            avatar: newTeamData.avatar,
            magiclink: newTeamData.magiclink,
            isActive: true,
            plan: 'Regular'
        }
        toast.success("Team Created", options)
    } else {
        toast.error("Team creation failed", options)
    }
}

export const teamsbyuserid = async ({ state, effects }, values) => {

    state.loadingTeams = true
    state.loadingRooms = true
    let dump = await effects.postHandler(process.env.REACT_APP_getTeamsUrl, values)
    if (dump.teams !== []) {
        dump.teams.map((t) => {
            state.teamDataInfo[t.teamid] = {
                teamid: t.teamid,
                teamowner: t.teamowner,
                teamname: t.teamname,
                avatar: t.avatar,
                magiclink: t.magiclink,
                isActive: false,
                plan: 'Regular'
            }
        })
    }

    if (state.activeTeamId === 0) {
        state.activeTeamId = dump.teams[0].teamid
    }

    state.teamDataInfo[state.activeTeamId].isActive = true
    state.loadingRooms = false
    state.loadingTeams = false
}

export const usersbyteamid = async ({ state, effects }, values) => {

    state.loadingMembers = true
    let dump = await effects.postHandler(process.env.REACT_APP_getTeamMembersUrl, values)

    state.memberList = []
    if (dump.users !== []) {
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
    state.loadingRooms = true
    state.RoomListArray.unshift(values)
    state.loadingRooms = false
}

export const removeRoom = async ({ state }, values) => {
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
        return member.userid !== values
    })
    state.memberList = arr
    state.loadingMembers = false;
    // TODO REmove user from the backend db by teamid, userid. 
}

export const getTeamRoomsFromId = async ({ state, effects }, values) => {
    // Passed Team Id.
}

export const getOnlineMembersList = async ({ state, effects }, value) => {
    // Online members List.
}