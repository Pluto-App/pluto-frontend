/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../../widgets/BackButton'

import {AuthContext} from '../../../context/AuthContext'

const UserProfile = React.memo(() => {

    let history = useHistory();
    const { authData, setAuthData } = useContext(AuthContext);

    const { state, actions } = useOvermind();

    const logout = (e) => {
        
        e.preventDefault();
        
        actions.auth.logOut({setAuthData: setAuthData}).then(() => {

            window.require("electron").ipcRenderer.send('logout');
            var curentWindow = window.require("electron").remote.getCurrentWindow();
            curentWindow.close(); 
        });
    }

    useEffect(() => {

        actions.user.getLoggedInUser({authData: authData})

    }, [actions, authData])

    return (
        <div className="w-full flex">
            <div className="bg-black  flex-1 px-3 text-white pt-2" style={{ height: "calc(100vh - 30px)" }}>
                <BackButton></BackButton>
                <p className="text-grey font-bold text-sm tracking-wide mt-2">STATUS</p>
                <div className="mt-3 mb-4 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
                <div className="flex">
                    <div className="bg-white h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-full mb-1 overflow-hidden">
                        <img src={state.userProfileData.avatar} alt="" />
                    </div>
                    <div className="ml-3">
                        <p className="font-bold text-white">{state.userProfileData.username}</p>
                        <p className="text-gray-500">{state.userProfileData.useremail}</p>
                    </div>
                </div>
                <p className="text-grey font-bold mb-4 text-sm tracking-wide mt-5">OPTIONS</p>
                <div className="mt-3 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
                <button className="w-full text-white hover:bg-gray-800 rounded-lg p-1 flex items-center mt-2" >
                    <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>center_focus_strong</i>Focus Mode</button>
                <div className="mt-3 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
                <button className="w-full text-white hover:bg-gray-800 rounded-lg p-1 flex items-center mt-2" >
                    <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>favorite</i>Share About Us</button>
                <div className="mt-3 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
                <button className="w-full text-white hover:bg-gray-800 rounded-lg p-1 flex items-center mt-2" onClick={() => { history.push('/user-update') }}>
                    <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>settings</i>Update Profile</button>
                <div className="mt-3 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
                <div className="mt-3">
                    <button className="w-full text-white hover:bg-gray-800 rounded-lg p-1 flex items-center mt-2" onClick={logout} type="button">
                        <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>logout</i>Sign Out</button>
                </div>
                <div className="mt-3 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
            </div>
        </div>
    )
})

export default UserProfile;