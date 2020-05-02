import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../tidbits/BackButton'
import Sidebar from '../../widgets/Sidebar'
import MainBar from '../../widgets/MainBar'
import { css } from "@emotion/core";
import RingLoader from "react-spinners/RingLoader";

export default function UserProfile() {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    const override = css`
        display: block;
        margin: 0 auto;
        border-color: red;
    `;

    const logout = (e) => {
        e.preventDefault();
        actions.handleLogout().then(() => {
            window.require("electron").ipcRenderer.send('resize-login');
            history.push('/');
        }); 
    }

    return (
        <div className="w-full flex">
            <Sidebar></Sidebar>
            <div className="w-full bg-gray-900 ml-15 flex-1 text-white" style={{height: "calc(100vh - 30px)", marginLeft: "49px"}}>
                <MainBar />
                <BackButton url={'/home'}></BackButton>
                { state.userProfileData.picture == null ? <RingLoader
                    css={override}
                    size={75}
                    color={"red"}
                    loading={state.userProfileData.picture}
                /> :
                <div className="px-4 py-4 flex items-center justify-center text-black text-2xl rounded-full mb-1 overflow-hidden">
                    <img src={state.userProfileData.picture} alt="" />
                </div> }
                    <p className="text-grey font-bold text-sm px-5 tracking-wide mt-2">{state.userProfileData.name}</p>
                    <p className="text-grey font-bold text-sm px-5 tracking-wide mt-2">{state.userProfileData.email}</p>
                <div class="mt-3 mb-4 bg-grey-900" style={{ width:"90%"}}></div>
                    <button
                        onClick={logout}
                        className="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                        type="button"> Logout
                    </button> 
            </div>
        </div>
    )
    
}
