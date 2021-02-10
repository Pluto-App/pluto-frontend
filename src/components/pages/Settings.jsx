/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"
import ToastNotification from '../widgets/ToastNotification';


import {AuthContext} from '../../context/AuthContext'

const UserProfile = React.memo(() => {

    let history = useHistory();
    const { authData, setAuthData } = useContext(AuthContext);

    const { state, actions } = useOvermind();

    const [ activeSection, setActiveSection ] = useState('profile');
    const [ activeTeam, setActiveTeam ] = useState({});
    const [ newTeam, setNewTeam ] = useState({});
    const [ confirmTeamDelete, setConfirmTeamDelete ] = useState(false);
    const [ currentUser, setCurrentUser ] = useState(JSON.parse(localStorage.getItem('currentUser')).user);
    const [ hoverUser, setHoverUser ] = useState();
    const [ userName, setUserName ] = useState(JSON.parse(localStorage.getItem('currentUser')).user.name);

    const logout = (e) => {
        
        e.preventDefault();
        
        window.require("electron").ipcRenderer.send('logout');
        var curentWindow = window.require("electron").remote.getCurrentWindow();
        curentWindow.close(); 
    }

    const createTeam = async (e) => {
        e.preventDefault();
        
        var teamData = {name: newTeam.name, user_id: currentUser.id}
        var team = await actions.team.createTeam({ authData: authData, teamData: teamData})

        if(currentUser){
            setCurrentUser({...currentUser, teams: [...currentUser.teams, team]});    
        }

        ToastNotification('success', "New Team Added!")  
        setNewTeam({});
    }

    const updateUser = async () => {
        
        var userData = {name: userName, id: state.userProfileData.id}
        await actions.user.updateUser({ authData: authData, userData: userData})

        ToastNotification('success', "Profile Updated!")
    }

    const updateTeam = async () => {
        

        if(activeTeam){
            var teamData = {name: activeTeam.name, id: activeTeam.id}
            var updatedTeam = await actions.team.updateTeam({ authData: authData, teamData: teamData})

            if(currentUser){
                let userTeams = [...currentUser.teams];
                var index = userTeams.findIndex(team => team.id == updatedTeam.id);

                userTeams[index]['name'] = updatedTeam.name;
                setCurrentUser({...currentUser, teams: userTeams});    
            }

            ToastNotification('success', "Team Updated!")  

        }
        
    }

    const deleteTeam = async () => {
        
        if(activeTeam){
            var teamData = { id: activeTeam.id}
            await actions.team.deleteTeam({ authData: authData, teamData: teamData})

            if(currentUser){
                let userTeams = [...currentUser.teams];
                var index = userTeams.findIndex(team => team.id == activeTeam.id);
                
                userTeams.splice(index, 1);
                setCurrentUser({...currentUser, teams: userTeams});
                setActiveSection('profile');     
            }

            ToastNotification('success', "Team Deleted!")  
        }
    }

    useEffect(() => {

        async function fetchUser() {
            setCurrentUser(await actions.user.getLoggedInUser({authData: authData}))
        }
        fetchUser();

    }, [actions, authData])

    const containerStyle = {
        background: '#2F3136',
        height: 'calc(100vh - 0px)'
    }

    const confirmDialogueStyle = {
        bottom: 'calc(100vh - (100vh/2))',
        left: 'calc(100vw - (100vw/2))',
        "height": "105px",
        "width": "240px",
        "position": "absolute",
        'background': '#25272C'
    }

    return (
        <div className="w-full flex" style={containerStyle}>
            
            <div className="text-white pt-2" style={{ width: '200px', background: '#202225'}}>
                
                <div className="w-full draggable-elem" style={{ height: '20px'}}></div>

                <div className='pt-5'>
                    
                    <div 
                        className={
                            activeSection == 'profile' ? 
                            'px-3 pt-2 pb-2 flex pointer settings-menu-item active' 
                            : 
                            'px-3 pt-2 pb-2 flex pointer settings-menu-item'
                        }
                        onClick ={function(){ setActiveSection('profile') }}
                    >
                        <div className="bg-white h-6 w-6 flex items-center justify-center rounded-full mr-3 overflow-hidden">
                            <img src={state.userProfileData.avatar} alt="" />
                        </div> 
                        <div>
                            Profile
                        </div>
                    </div>

                    <div className={
                            activeSection == 'preferences' ? 
                            'px-3 pt-2 pb-2 flex pointer settings-menu-item active' 
                            : 
                            'px-3 pt-2 pb-2 flex pointer settings-menu-item'
                        }
                        onClick ={function(){ setActiveSection('preferences') }}
                    >
                        <div className="flex items-center justify-center overflow-hidden">
                            <i className="material-icons md-light md-inactive mr-3" style={{ fontSize: "24px" }}>tune</i>
                        </div> 
                        <div>
                            Preferences
                        </div>
                    </div>

                </div>

                <div className="mt-8" style={{ height: "1px", width: "100%", background: '#484e52' }}></div>

                <p className="text-grey text-md tracking-wide mt-3 px-3">TEAMS</p>

                <div className='pt-5' 
                    style={{
                            maxHeight: 'calc(100vh - 400px)',
                            overflowY: 'scroll'
                    }}
                >
                    {
                        currentUser.teams && currentUser.teams.map(team => 
                            <div 
                                key={team.id}
                                className={
                                    activeSection == 'team' && activeTeam.id == team.id ? 
                                    'px-3 pt-2 pb-2 flex pointer settings-menu-item active' 
                                    : 
                                    'px-3 pt-2 pb-2 flex pointer settings-menu-item'
                                }
                                onClick ={function(){ 
                                    setActiveSection('team') 
                                    setActiveTeam(team)
                                    actions.team.getTeam({authData: authData, team_id: team.id})
                                }}
                            >
                                <div className="bg-white h-8 w-8 flex items-center justify-center mr-3 overflow-hidden">
                                    <img src={team.avatar} alt="" />
                                </div> 
                                <div>
                                    {team.name}
                                </div>
                            </div>
                        )
                    }
                    <div 
                        className={
                            activeSection == 'create-team' ? 
                            'px-3 pt-2 pb-2 flex pointer settings-menu-item active' 
                            : 
                            'px-3 pt-2 pb-2 flex pointer settings-menu-item'
                        }
                        onClick ={function(){ 
                            setActiveSection('create-team') 
                        }}
                    >
                        <div className="mr-3 bg-black flex items-center justify-center overflow-hidden" 
                            style={{width: '34px', height: '34px', float: 'left'}}>
                            <i className="material-icons hover:bg-gray-700" style={{ fontSize: "18px", margin: "0" }}
                                style={{ transition: "all .60s ease" }}
                            >add</i>
                        </div> 
                        <div>
                            Create Team
                        </div>
                    </div>
                </div>

                <div className="mt-8" style={{ height: "1px", width: "100%", background: '#484e52' }}></div>

                <div className='pt-5'>

                    <div className='px-3 pt-2 pb-2 flex pointer settings-menu-item' 
                        onClick ={function(e){ logout(e) }}
                    >
                        <div className="flex items-center justify-center overflow-hidden">
                            <i className="material-icons md-light md-inactive mr-3" style={{ fontSize: "24px" }}>logout</i>
                        </div> 
                        <div>
                            Sign Out
                        </div>
                    </div>

                </div>
            </div>

            <div className="flex-1 px-12 text-white pt-2" style={{ height: "calc(100vh - 0px)" }}>
                <div className="w-full draggable-elem" style={{ height: '20px'}}></div>

                {
                    activeSection == 'profile' && 

                    <div>

                        <p className="text-grey font-bold text-lg tracking-wide mt-2 mb-12">My Profile</p>

                        <div className="flex">
                            <div className="bg-white h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-full mb-1 overflow-hidden">
                                <img src={state.userProfileData.avatar} alt="" />
                            </div>
                            <div className="ml-3">
                                <p className="font-bold text-white">{state.userProfileData.name}</p>
                                <p className="text-gray-500">{state.userProfileData.email}</p>
                            </div>
                        </div>
                        
                        <div className="mt-6" style={{ height: "1px", width: "100%", background: '#484e52' }}></div>

                        <p className="text-grey text-md tracking-wide mt-12 mb-8">My Info</p>

                        <div className="flex">
                            <div className="flex items-center justify-center text-grey text-md font-semibold mb-1 overflow-hidden">
                                <p className="font-bold text-white">Name: </p>
                            </div>
                            <div className="ml-3">
                                <input className="shadow appearance-none border rounded w-full py-1 px-5 text-gray-700"
                                    style={{ width: "100%" }}
                                    onChange={(e) =>
                                        //state.userProfileData.name = e.target.value
                                        setUserName(e.target.value)
                                    }
                                    type="text"
                                    value={userName}
                                    autoFocus 
                                />
                            </div>
                        </div>

                        <div className="pin-b pb-4" style={{}}>
                            <div className="mt-4 w-full" style={{width: '105px', display: 'inline-block'}}>
                                <button
                                    className="w-full flex justify-center items-center
                                    text-white py-2 mt-2"
                                    type="button"
                                    style={{ background: '#202225', fontSize: '14px', borderRadius: '8px' }}
                                    onClick={() => {
                                        updateUser()
                                        //toggleshowInviteModal(showInviteModal => !showInviteModal)
                                    }}>
                                    <i className="material-icons mr-2" style={{ fontSize: '14px' }}>save</i>Update
                                </button>
                            </div>
                        </div>

                    </div>
                }

                {
                    activeSection == 'preferences' && 

                    <div>

                        <p className="text-grey font-bold text-lg tracking-wide mt-2 mb-12">Preferences</p>

                    </div>
                }


                {
                    activeSection == 'team' &&

                    <div>
                        <div className="flex">
                            <div className="h-8 w-8 flex items-center justify-center overflow-hidden">
                                <img src={activeTeam.avatar} alt="" />
                            </div>
                            <div className="ml-3" style={{alignSelf: 'flex-end'}}>
                                <p className="text-grey font-bold text-lg tracking-wide">
                                    {activeTeam.name}
                                </p>
                            </div>
                        </div>
                        

                        <p className="text-grey text-md tracking-wide mt-12 mb-8">Team Members</p>

                        <div className="">
                            {
                                state.currentTeam.users && state.currentTeam.users.map(user => 
                                    <div 
                                        key={user.id}
                                        className='px-3 pt-2 pb-2 flex pointer settings-menu-item'
                                        onClick ={function(){ 
                                            //setActiveSection('team') 
                                            //setActiveTeam(team) 
                                        }}
                                        onMouseEnter={function(){ 
                                            setHoverUser(user.id)
                                        }}
                                        onMouseLeave={function(){ 
                                            setHoverUser()
                                        }}
                                    >
                                        <div 
                                            className="flex items-center justify-center mr-3 overflow-hidden"
                                            style={{height: '30px', width: '30px'}}
                                        >
                                            <img src={user.avatar} alt="" />
                                        </div> 
                                        <div>
                                            {user.name}
                                        </div>
                                        <div>
                                            {
                                                hoverUser == user.id && 
                                            
                                                 <button
                                                    className="w-full flex justify-center items-center text-white ml-2"
                                                    type="button"
                                                    style={{ 
                                                        background: '#202225', fontSize: '12px', borderRadius: '8px', padding: '5px' 
                                                    }}
                                                    onClick={() => {
                                                        //updateUser()
                                                        //toggleshowInviteModal(showInviteModal => !showInviteModal)
                                                    }}>
                                                    <i className="material-icons mr-2" style={{ fontSize: '12px' }}>delete</i>
                                                    <span className='mr-1'>Remove</span>
                                                </button>
                                            }
                                        </div>
                                    </div>
                                )
                            }
                        </div>

                        <div className="mt-6" style={{ height: "1px", width: "100%", background: '#484e52' }}></div>

                        <p className="text-grey text-md tracking-wide mt-12 mb-8">Team Settings</p>

                        <div className="flex">
                            <div className="flex items-center justify-center text-grey text-md font-semibold mb-1 overflow-hidden">
                                <p className="font-bold text-white">Name: </p>
                            </div>
                            <div className="ml-3">
                                <input className="shadow appearance-none border rounded w-full py-1 px-5 text-gray-700"
                                    style={{ width: "100%" }}
                                    onChange={(e) =>
                                        //state.userProfileData.name = e.target.value
                                        setActiveTeam({...activeTeam, name: e.target.value })
                                    }
                                    type="text"
                                    value={activeTeam.name}
                                    autoFocus 
                                />
                            </div>
                        </div>

                        <div className="pin-b pb-4" style={{}}>
                            <div className="mt-4 w-full" style={{width: '105px', display: 'inline-block'}}>
                                <button
                                    className="w-full flex justify-center items-center bg-purple-700
                                    text-white py-2 mt-2"
                                    type="button"
                                    style={{  fontSize: '14px', borderRadius: '8px' }}
                                    onClick={() => {
                                        updateTeam()
                                    }}>
                                    <i className="material-icons mr-2" style={{ fontSize: '14px' }}>save</i>Update
                                </button>
                            </div>
                            <div className="mt-4 w-full ml-3" style={{width: '125px', display: 'inline-block'}}>
                                <button
                                    className="w-full flex justify-center items-center bg-pink-700
                                    text-white py-2 mt-2"
                                    type="button"
                                    style={{ fontSize: '14px', borderRadius: '8px' }}
                                    onClick={() => {
                                        setConfirmTeamDelete(true)
                                    }}>
                                    <i className="material-icons mr-2" style={{ fontSize: '14px' }}>delete</i>Delete Team
                                </button>
                            </div>
                        </div>

                        {
                           confirmTeamDelete &&
                            <div className="items-center absolute rounded-lg mx-1 p-1 py-1" style={confirmDialogueStyle}>

                                <div className="items-center px-2">
                                    <p className="text-grey font-bold tracking-wide text-xs center mt-2 mb-2">
                                        Remove {activeTeam.name} ?
                                    </p>

                                    <div className="flex">
                                        <button
                                        className="rounded-full flex justify-center items-center bg-green-700
                                        text-white py-2 px-4 mt-2 mr-2 focus:outline-none focus:shadow-outline"
                                        type="button"
                                        style={{ transition: "all .60s ease", fontSize: '14px' }}
                                        onClick={(e) => {
                                            setConfirmTeamDelete(false)
                                            deleteTeam(e)
                                        }}>
                                            <i 
                                                className="material-icons md-light md-inactive mr-2"
                                                style={{fontSize: '18px'}}
                                            >
                                                check
                                            </i> Confirm
                                        </button>

                                        <button
                                        className="rounded-full flex justify-center items-center bg-red-700
                                        text-white py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                                        type="button"
                                        style={{ transition: "all .60s ease", fontSize: '14px' }}
                                        onClick={() => {
                                            setConfirmTeamDelete(false)
                                        }}>
                                             <i 
                                                className="material-icons md-light md-inactive mr-2"
                                                style={{fontSize: '18px'}}
                                            >
                                                close
                                            </i> Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                }

                {
                    activeSection == 'create-team' && 

                    <div>

                        <p className="text-grey font-bold text-lg tracking-wide mt-2 mb-12">Create Team</p>

                        <div className="flex">
                            <div className="flex items-center justify-center text-grey text-md font-semibold mb-1 overflow-hidden">
                                <p className="font-bold text-white">Name: </p>
                            </div>
                            <div className="ml-3">
                                <input className="shadow appearance-none border rounded w-full py-1 px-5 text-gray-700"
                                    style={{ width: "100%" }}
                                    onChange={(e) =>
                                        setNewTeam({...newTeam, name: e.target.value})
                                    }
                                    type="text"
                                    value={newTeam.name}
                                    autoFocus 
                                />
                            </div>
                        </div>

                        <div className="pin-b pb-4" style={{}}>
                            <div className="mt-4 w-full" style={{width: '105px', display: 'inline-block'}}>
                                <button
                                    className="w-full flex justify-center items-center
                                    text-white py-2 mt-2"
                                    type="button"
                                    style={{ background: '#202225', fontSize: '14px', borderRadius: '8px' }}
                                    onClick={(e) => {
                                        createTeam(e)
                                    }}>
                                    <i className="material-icons mr-2" style={{ fontSize: '14px' }}>save</i>Create
                                </button>
                            </div>
                        </div>


                    </div>
                }

            </div>
        </div>
    )
})

export default UserProfile;