/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import Sidebar from '../widgets/Sidebar'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"
import MainBar from "../widgets/MainBar"
import UserListItem from "./Users/UserListItem"
import RoomListItem from "./Rooms/RoomListItem"
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";
import ToastNotification from '../widgets/ToastNotification'
import { sha224 } from 'js-sha256'

import { AuthContext } from '../../context/AuthContext'

import { socket_live, events } from '../../components/sockets'

import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:3000";

// TODO Move Active Win info to user profile (not necessary?)
// FIXME Add Active Win Support. The package fails to build. Search Alternatives. 
const RoomList = ((rooms) => {

    const roomlist = rooms.map((room) =>
        <RoomListItem
            id={room.id}
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

const MembersList = (({users, onlineUsers}) => {

    const teamMemberList = Object.entries(users).map(([id, member]) =>
        <UserListItem
            id={member.id}
            uid={member.uid}
            key={member.id.toString()}
            url={member.avatar}
            name={member.name}
            email={member.email}
            statusColor={onlineUsers.includes(member.id) ? 'green' : member.statusColor}
        />
    )

    return (
        <div>
            {teamMemberList}
        </div>
    );
});

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


    // TODO : Shift to App Level stuff 
    useEffect(() => {
        const setActiveWin = setInterval(async () => {
            try {
            
                const activeWinAppData = await window.require("electron").ipcRenderer.sendSync('active-win');
                actions.app.setActiveWinInfo(activeWinAppData)

            } catch (error) {
                if(process.env.REACT_APP_DEV_BUILD)
                    console.log(error);
            }
        }, 3000)
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


    const addRoom = async (roomname) => {

        let roomData = {
            team_id: state.currentTeamId,
            name: roomname
        }

        actions.room.addRoom({authData: authData, roomData: roomData})
    }

    const handleChange = async (e) => {
        updateNewRoomName(e.target.value);
    }

    const customStyle = {
        "top": "46%",
        "width": "calc(94% - 50px)"
    }

    return (
        <div className="w-full flex">
            <Sidebar></Sidebar>
            <div className="w-full bg-black ml-15 flex-1 text-white" style={{ height: "calc(100vh - 30px)", marginLeft: "49px" }}>
                <MainBar
                    userid={state.userProfileData.id}
                    teamid={state.currentTeam.id}
                    appName={appInfo}
                />
                <div className="sidebar-icons" style={{ height: "relative" }}>
                    <div className="flex justify-between items-center p-1 pl-1 hover:bg-gray-800"
                        style={{ transition: "all .60s ease" }}
                    >
                        <div className="text-gray-500 px-3 font-bold tracking-wide text-xs">Rooms</div>
                        <button className="text-white focus:outline-none hover:bg-gray-800">
                            <i className="material-icons md-light md-inactive" onClick={(e) => {
                                e.preventDefault();
                                actions.app.setAddingRoom(true)
                            }} style={{ fontSize: "18px", margin: "0" }}>add</i>
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
                    <div className="" style={{ height: "115px", overflowY: "scroll" }}>
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
                    <div className="flex justify-center items-center" style={{ height: "15px" }}>
                        <div className="text-gray-500"></div>
                        <button className="text-white focus:outline-none">
                            <i className="material-icons hover:bg-gray-700" style={{ fontSize: "18px", margin: "0" }}
                                style={{ transition: "all .60s ease" }}
                            >keyboard_arrow_down</i>
                        </button>
                    </div>
                </div>

                <div className="sidebar-icons" style={{ height: "relative" }}>
                    <div className="flex justify-between items-center p-2 pl-2 hover:bg-gray-800"
                        style={{ transition: "all .60s ease" }}
                    >
                        <div className="text-gray-500 px-3 font-bold tracking-wide text-xs">Team Mates</div>
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
                <div className="flex justify-center items-center" style={{ height: "15px" }}>
                    <div className="text-gray-500"></div>
                    <button className="text-white focus:outline-none">
                        <i className="material-icons hover:bg-gray-700" style={{ fontSize: "18px", margin: "0" }}
                            style={{ transition: "all .60s ease" }}
                        >keyboard_arrow_down</i>
                    </button>
                </div>
                <div className="absolute pin-b pb-4" style={{ width: "calc(95% - 50px)" }}>
                    <div className="mt-4 px-3 w-full">
                        <button
                            className="bg-indigo-800 w-full rounded-full flex justify-center items-center hover:bg-indigo-400 
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
                            <h4 className="font-bold text-xl text-gray-600 text-center mb-2"> Invite Teammates to <br /> Pluto Office </h4>
                            <p className="text-purple-700 mb-3 text-center">
                                Share this link with others to grant access to this team.
                        </p>
                            <input
                                id="InviteModalLink"
                                value={'https://joinpluto.netlify.app/#/j/' + state.currentTeam.tid}
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