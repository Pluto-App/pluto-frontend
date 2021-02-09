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
    const [ userName, setUserName ] = useState(JSON.parse(localStorage.getItem('currentUser')).user.name);

    const logout = (e) => {
        
        e.preventDefault();
        
        actions.auth.logOut({setAuthData: setAuthData}).then(() => {

            window.require("electron").ipcRenderer.send('logout');
            var curentWindow = window.require("electron").remote.getCurrentWindow();
            curentWindow.close(); 
        });
    }

    const addTeam = (e) => {
        e.preventDefault()
        //history.push('/add-team');
    }

    const updateUser = async () => {
        
        var userData = {name: userName, id: state.userProfileData.id}
        await actions.user.updateUser({ authData: authData, userData: userData})

        ToastNotification('success', "Profile Updated!")
    }

    useEffect(() => {

        actions.user.getLoggedInUser({authData: authData})

    }, [actions, authData])

    const containerStyle = {
        background: '#2F3136',
        height: 'calc(100vh - 0px)'
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

                <div className='pt-5'>
                    {
                        state.userProfileData.teams && state.userProfileData.teams.map(team => 
                            <div 
                                key={team.id}
                                className={
                                    activeSection == team.id ? 
                                    'px-3 pt-2 pb-2 flex pointer settings-menu-item active' 
                                    : 
                                    'px-3 pt-2 pb-2 flex pointer settings-menu-item'
                                }
                                onClick ={function(){ setActiveSection(team.id) }}
                            >
                                <div className="bg-white h-6 w-6 flex items-center justify-center mr-3 overflow-hidden">
                                    <img src={team.avatar} alt="" />
                                </div> 
                                <div>
                                    {team.name}
                                </div>
                            </div>
                        )
                    }
                </div>

                <div className="mt-8" style={{ height: "1px", width: "100%", background: '#484e52' }}></div>

                <div className='pt-5'>

                    <div className='px-3 pt-2 pb-2 flex pointer settings-menu-item' 
                        onClick ={function(){ setActiveSection('preferences') }}
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
        </div>
    )
})

export default UserProfile;