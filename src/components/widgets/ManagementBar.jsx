/* eslint-disable no-unused-vars */
import React from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"

import MainTeamSelect from './MainTeamSelect';

const { ipcRenderer } = window.require("electron");

const MainBar = React.memo((props) => {

    let history = useHistory();
    const { state, actions } = useOvermind();

    const addTeam = (e) => {
        e.preventDefault()
        history.push('/add-team');
    }

    const teamSelectStyle = {
        background: '#202225',
        padding: '5px'
    }

    const mainStyle = {
        background: '#202225'
    }

    return (
        <div className="w-full flex" style={mainStyle}>

            <div className="relative" style={{ height: "42px", width: "100%"}}>
                <div className="flex justify-between items-center px-3 p-0">
                    <MainTeamSelect/>
                   
                    <div className="flex items-center">

                        <span onClick={(e) => {
                        }} className="flex items-center text-grey rounded-lg  px-1 py-1  no-underline cursor-pointer hover:bg-grey-darker">
                            <div className="bg-white h-6 w-6 flex items-center justify-center text-black text-2xl font-semibold 
                            rounded-lg mb-1 overflow-hidden">
                                <img src={state.userProfileData.avatar} alt="T" />
                            </div>
                        </span>

                        <button 
                            className="text-white hover:bg-gray-900 py-1 focus:outline-none rounded-lg p-1" 
                            onClick={(e) => {
                                e.preventDefault();
                                ipcRenderer.send('open-settings', state.userProfileData.userid);
                            }}
                        >
                            <i className="material-icons md-light md-inactive" style={{ fontSize: "16px", margin: "0" }}>settings</i>
                        </button>
                        
                    </div>
                </div>
            </div>
        </div>
    )
})

export default MainBar;