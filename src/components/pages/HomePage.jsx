/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import Sidebar from '../widgets/Sidebar'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"
import MainBar from "../widgets/MainBar"
import ManagementBar from "../widgets/ManagementBar"
import UserListItem from "./Users/UserListItem"
import RoomListItem from "./Rooms/RoomListItem"
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";
import ToastNotification from '../widgets/ToastNotification'
import { sha224 } from 'js-sha256'

import { AuthContext } from '../../context/AuthContext'

import { socket_live, events } from '../sockets'

import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:3000";

// TODO Move Active Win info to user profile (not necessary?)
// FIXME Add Active Win Support. The package fails to build. Search Alternatives. 
const RoomList = ((rooms) => {

    const roomlist = rooms.map((room) =>
        <RoomListItem
            id={room.id}
            rid={room.rid}
            key={room.id.toString()}
            name={room.name}
        />
    )

    return (
        <div>
            {roomlist}
        </div>
    );
})

const MembersList = (
    ({users}) => {

        const teamMemberList = Object.entries(users).map(([id, member]) =>
            <UserListItem
                id={member.id}
                uid={member.uid}
                key={member.id.toString()}
                url={member.avatar}
                name={member.name}
                email={member.email}
            />
        )

        return (
            <div className='members-list'>
                {teamMemberList}
            </div>
        );
    }
);

export default function HomePage() {

    let history = useHistory();
    const { authData } = useContext(AuthContext);

    const override = css`
        display: block;
        margin: 0 auto;
        border-color: white;
    `;

    const { state, actions } = useOvermind();
    const [copySuccess, togglecopySuccess] = useState(false);
    const [showInviteModal, toggleshowInviteModal] = useState(false);
    const [appInfo, updateAppInfo] = useState("No Teams");
    const [newRoomName, updateNewRoomName] = useState("");

    useEffect(() => {

        const setActiveWin = setInterval(async () => {
            try {
            
                const activeWinAppData = await window.require("electron").ipcRenderer.sendSync('active-win');
                actions.app.setActiveWinInfo(activeWinAppData);

            } catch (error) {
                if(process.env.REACT_APP_DEV_BUILD)
                    console.log(error);
            }
        }, 2000)
        
        return () => clearInterval(setActiveWin);

    }, [state.activeWindowApp])

    
    useEffect(() => {

        actions.user.getLoggedInUser({authData: authData})

    }, [actions, authData])

    
    useEffect(() => {

        if(state.currentTeamId){
            actions.team.getTeam({authData: authData, team_id: state.currentTeamId})    
        }

    }, [actions, authData, state.currentTeamId, state.teamUpdateReq])

    useEffect(() => {

        if(state.noTeams)
            history.push('/add-team');

    }, [state.noTeams])

    const addRoom = async (roomname) => {

        let roomData = {
            team_id: state.currentTeamId,
            name: roomname
        }

        actions.room.addRoom({authData: authData, roomData: roomData});
    }

    const handleChange = async (e) => {
        updateNewRoomName(e.target.value);
    }

    const customStyle = {
        "top": "46%",
        "width": "calc(94% - 50px)"
    }

    return (
        <div className="w-full flex main-container">
           {/* 
                <Sidebar></Sidebar>
           */} 
            
            <div className="w-full ml-15 flex-1 text-white" style={{ height: "calc(100vh - 30px)" }}>
                <ManagementBar />

                {/* 
                <MainBar
                        userid={state.userProfileData.id}
                        teamid={state.currentTeam.id}
                        appName={appInfo}
                />
                */} 

                <div className="rooms-list-container" style={{ height: "relative" }}>
                    <div className="flex justify-between items-center p-1 pl-1"
                        style={{ paddingRight: '25px', paddingBottom: '5px' }}
                    >
                        <div className="px-3 font-bold tracking-wide" style={{fontWeight: '600', color: '#C4C4C4', fontSize: '14px'}}>
                            ROOMS
                        </div>
                        
                        <button className="text-white focus:outline-none btn-add" onClick={(e) => {
                            e.preventDefault();
                            actions.app.setAddingRoom(true)
                        }}>
                        </button>
                    </div>
                    {
                        state.addingRoom &&
                        <div className="flex justify-center items-center hover:bg-gray-800">
                            <input className="shadow appearance-none border rounded w-full py-1 
                            px-5 text-gray-700 leading-tight focus:outline-none"
                                style={{ width: "95%" }}
                                onChange={handleChange}
                                onKeyUp={(e) => {
                                    if (e.keyCode === 13 || e.which === 13) {
                                        if (e.target.value === "") {
                                            ToastNotification('error', "Room name can't be empty")
                                        } else {
                                            actions.app.setAddingRoom(false);
                                            addRoom(e.target.value)
                                        }
                                    } else if(e.keyCode === 27 || e.which === 27) {

                                        actions.app.setAddingRoom(false)
                                    }
                                }}
                                name="roomname"
                                id="roomname"
                                type="text"
                                placeholder="Add New Room"
                                autoFocus />
                        </div>
                    }
                    <div className="" style={{ minHeight: "80px", maxHeight: "225px", overflowY: "scroll" }}>
                        {
                            !state.loadingCurrentTeam ?
                                RoomList(state.currentTeam.rooms) :
                                <BeatLoader
                                    css={override}
                                    size={10}
                                    color={"white"}
                                    loading={state.loadingCurrentTeam}
                                />
                        }
                    </div>
                </div>

                <div className="members-list-container" style={{ height: "relative" }}>
                    <div className="flex justify-between items-center p-1 pl-1">
                        <div className="px-3 font-bold tracking-wide" style={{fontWeight: '600', color: '#BABBBE', fontSize: '14px'}}>
                            TEAMMATES
                        </div>
                    </div>
                    {
                        !state.loadingCurrentTeam ?
                            MembersList({users: state.currentTeam.users, onlineUsers: state.onlineUsers}) :
                            <BeatLoader
                                css={override}
                                size={10}
                                color={"white"}
                                loading={state.loadingCurrentTeam}
                            />
                    }
                </div>

                <div className="pin-b pb-4 center" style={{position: 'absolute', bottom: '20px', left: 'calc(100vw/2 - 120px)'}}>
                    <div className="mt-4 px-3 w-full" style={{width: '240px', display: 'inline-block'}}>
                        <button
                            className="w-full rounded-full flex justify-center items-center bg-purple
                            text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                            type="button"
                            style={{ transition: "all .60s ease" }}
                            onClick={() => {
                                togglecopySuccess(false);
                                toggleshowInviteModal(showInviteModal => !showInviteModal)
                            }}>
                            <i className="material-icons md-light md-inactive mr-2">person_add</i>Invite Teammates
                        </button>
                    </div>
                </div>

                {
                    // Invite Modal HTML
                    showInviteModal && state.currentTeamId ?
                        <div className="items-center absolute rounded-sm bg-white mx-2 p-1 py-1" style={customStyle}
                            onClick={(e) => {
                            }}>
                            <h4 className="font-bold text-xl text-gray-600 text-center mb-2"> Add Teammates</h4>
                            <p className="text-purple-700 mb-3 text-center">
                                Share this code to add teammates to this team.
                        </p>
                            <textarea
                                rows='3'
                                id="InviteModalLink"
                                value={'Team Code: ' + state.currentTeam.tid + '\n' + 'Download App: https://joinpluto.netlify.app/'}
                                style={{ resize: 'none'}}
                                className="w-full shadow appearance-none border text-purple-700 rounded py-1 px-1 bg-purple-200" />
                            <button
                                className="bg-purple-700 w-full rounded-sm flex justify-center text-white items-center hover:bg-purple-500
                                text-white font-bold py-2 px-2 mt-2 focus:outline-none focus:shadow-outline"
                                type="button"
                                style={{ transition: "all .60s ease" }}
                                onClick={(e) => {
                                    var copyText = document.getElementById("InviteModalLink");
                                    copyText.select();
                                    copyText.setSelectionRange(0, 99999)
                                    document.execCommand("copy");
                                    togglecopySuccess(true);
                                    setTimeout(() => toggleshowInviteModal(showInviteModal => !showInviteModal), 1000);
                                }}
                            >{!copySuccess ? "Copy Invite" : "Copied !!"}</button>
                        </div> :
                        <div></div>
                }
            </div>
        </div>
    )

}