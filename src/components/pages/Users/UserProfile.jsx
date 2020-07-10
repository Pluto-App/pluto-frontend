/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../../widgets/BackButton'

const UserProfile = React.memo(() => {

    let history = useHistory();

    const { state, actions } = useOvermind();

    const logout = (e) => {
        e.preventDefault();
        actions.handleLogout().then(() => {
            window.require("electron").ipcRenderer.send('resize-login');
            history.push('/');
        });
    }

    return (
        <div className="w-full flex">
            <div className="bg-black  flex-1 px-3 text-white pt-2" style={{ height: "calc(100vh - 30px)" }}>
                <BackButton url={'/home'}></BackButton>
                <p className="text-grey font-bold text-sm tracking-wide mt-2">STATUS</p>
                <div className="mt-3 mb-4 bg-gray-900" style={{ height: "1px", width: "100%" }}></div>
                <div className="flex">
                    <div className="bg-white h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-full mb-1 overflow-hidden">
                        <img src={state.userProfileData.avatar} alt="" />
                    </div>
                    <div className="ml-3">
                        <p className="font-bold text-white">{state.userProfileData.username}</p>
                        <p className="text-gray-500">{state.userProfileData.useremail}</p>
                        {/* <button className="flex px-1 mt-2 items-center text-gray-500 font-bold rounded-lg hover:text-white cursor-pointer hover:bg-gray-900">
                            <svg height="10" width="10">
                                <circle cx="6" cy="6" r="4" stroke="black" stroke-width="0" fill="green" />
                                Sorry, your browser does not support inline SVG.
                            </svg><span className="ml-2">Online</span>
                            <i className="material-icons md-light md-inactive ml-1 mt-1" style={{ fontSize: "15px" }}>unfold_more</i>
                        </button> */}
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