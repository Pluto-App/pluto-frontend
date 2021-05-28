import React, { useState, useContext } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../../widgets/BackButton'
import ToastNotification from '../../widgets/ToastNotification';

import {AuthContext} from '../../../context/AuthContext'

const { ipcRenderer } = window.require("electron");

export default function TeamRegisterPage() {

    const { authData, setAuthData } = useContext(AuthContext);
    let history = useHistory();

    const [teamName, setTeamName] = useState('');
    const [teamCode, setTeamCode] = useState('');

    const override = {
        display: 'block',
        margin: '0 auto',
        borderColor: 'green'
    }

    const { state, actions } = useOvermind();

    const createTeam = async (e) => {

        e.preventDefault();

        var teamData = {
            owner_id: state.userProfileData.id,
            name: teamName
        }

        if (teamName !== "" && teamName.length >= 3) {
            await actions.team.createTeam({authData: authData, teamData: teamData})
            history.push('/')
        }
        else {
            ToastNotification('error', "Must be 3 letters or more.")
        }
    }

    const joinTeam = async (e) => {

        e.preventDefault();

        var reqData = {
            user_id: state.userProfileData.id,
            tid: teamCode
        }

        if (teamCode.length === 12 || teamCode.length === 14) {
            await actions.team.addUser({authData: authData, reqData: reqData})
            history.push('/')
        }
        else {
            ToastNotification('error', "Team Code doesn't seem correct!")
        }
    }

    const logout = (e) => {
        
        actions.auth.logOut({setAuthData: setAuthData}).then(() => {
            history.push('/');
            ipcRenderer.send('resize-login');
        });
    }

    return (
        <div className="w-full flex main-container">
            <div className="w-full ml-15 flex-1 text-white" style={{ height: "calc(100vh - 30px)" }}>
                {
                    state.noTeams ? 
                    ''
                    : <BackButton url={'/'}></BackButton>
                }
                
                <p className="font-bold px-4 text-white">Create New Team</p>
                <form className="px-4 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-600 text-sm font-bold mb-2" htmlFor="teamname">
                            Team Name
                        </label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight 
                            focus:outline-none focus:shadow-outline"
                            name="teamname"
                            id="teamname"
                            type="text"
                            placeholder="Team Name"
                            onChange={(e) => { setTeamName(e.target.value) }}
                            autoFocus />
                    </div>
                    {
                        <div className="flex items-center justify-between">
                            <button className="bg-indigo-500 w-full hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded 
                                focus:outline-none focus:shadow-outline" type="button" onClick={createTeam}>
                                Create Team
                            </button>
                        </div> 
                    }
                </form>

                <div className="flex justify-center items-center" style={{ height: "15px" }}>
                    <div className="text-gray-500"></div>
                    Or
                </div>

                <p className="font-bold px-4 text-white">Join a Team</p>
                <form className="px-4 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-600 text-sm font-bold mb-2" htmlFor="teamcode">
                            Team Code
                        </label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight 
                            focus:outline-none focus:shadow-outline"
                            name="teamcode"
                            id="teamcode"
                            type="text"
                            placeholder="Team Code"
                            onChange={(e) => { setTeamCode(e.target.value) }}
                            autoFocus />
                    </div>
                    <div className="flex items-center justify-between">
                        <button className="bg-pink-500 w-full hover:bg-pink-700 text-white font-bold py-2 px-4 rounded 
                            focus:outline-none focus:shadow-outline" type="button" onClick={joinTeam}>
                            Join Team
                        </button>
                    </div> 
                </form>

                 {
                    state.noTeams &&
                    <div className='px-4 pt-6 pb-8 mb-4'>

                        <div className="flex items-center justify-between">
                            <button className="w-full text-white font-bold py-2 px-4 rounded 
                                focus:outline-none focus:shadow-outline" type="button" onClick={logout}
                                style={{ background: '#202225', fontSize: '14px' }}
                            >
                                Sign Out
                            </button>
                        </div>

                    </div>
                }

                
            </div>

        </div>
    )
}