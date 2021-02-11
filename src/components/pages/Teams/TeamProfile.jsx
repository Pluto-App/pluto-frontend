/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import { AuthContext } from '../../../context/AuthContext'

import BackButton from '../../widgets/BackButton'

export default function TeamProfile() {

    let history = useHistory();
    const { authData } = useContext(AuthContext);

    const { state, actions } = useOvermind();

    const removeTeam = async (e) => {

        e.preventDefault();
        var teamData = {
            id: state.currentTeamId,
        }
       
        await actions.team.deleteTeam({authData: authData, teamData: teamData});
        history.push('/');
    }

    return (
        <div className="w-full flex main-container">
            <div className="flex-1 px-3 text-white pt-2" style={{ height: "calc(100vh - 30px)" }}>
                <BackButton url={'/'}></BackButton>
                <p className="text-grey font-bold text-sm tracking-wide mt-2">TEAM INFO</p>
                <div className="mt-3 mb-4 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
                <div className="flex">
                    <div className="bg-white h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-full mb-1 overflow-hidden">
                        <img src={state.currentTeam.avatar} alt="" />
                    </div>
                    <div className="ml-3">
                        <p className="font-bold text-white">{state.currentTeam.name}</p>
                        <p className="text-gray-500">{}</p>
                        <button className="flex px-1 mt-2 items-center text-gray-500 font-bold rounded-lg focus:outline-none hover:text-white cursor-pointer hover:bg-gray-900">
                            <svg height="10" width="10">
                                <circle cx="6" cy="6" r="4" stroke="black" fill="green" />
                                Sorry, your browser does not support inline SVG.
                            </svg><span className="ml-2">{}</span>
                            <i className="material-icons md-light md-inactive ml-1 mt-1" style={{ fontSize: "15px" }}>chat</i>
                        </button>
                    </div>
                </div>
                <p className="text-grey font-bold mb-4 text-sm tracking-wide mt-5">OPTIONS</p>
                
                <div className="mt-3 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
                <button className="w-full text-white hover:bg-gray-800 rounded-lg p-1 flex items-center mt-2" >
                    <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>redeem</i>{}
                </button>
                
                <div className="mt-3 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
                <button className="w-full text-white hover:bg-gray-800 rounded-lg p-1 flex items-center mt-2">
                    <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>settings</i>Update Team
                </button>
                
                <div className="mt-3 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
                <button className="w-full text-white hover:bg-gray-800 rounded-lg p-1 flex items-center mt-2" onClick={removeTeam}>
                    <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>delete</i>
                    Remove Team
                </button>

                {/* 
                <button className="w-full text-white hover:bg-gray-800 rounded-lg p-1 flex items-center mt-2" onClick="">
                    <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>trending_up</i>Upgrade Plan</button>
                */}
            </div>
        </div>
    )
}