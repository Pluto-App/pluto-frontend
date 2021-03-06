
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"
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

export default function HomePage() {

    let history = useHistory();
    const { authData, setAuthData } = useContext(AuthContext);


    const override = css`
        display: block;
        margin: 0 auto;
        border-color: white;
    `;

    const { state, actions } = useOvermind();
    const [copySuccess, togglecopySuccess] = useState(false);
    const [showInviteModal, toggleshowInviteModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [appInfo, updateAppInfo] = useState("No Teams");
    const [newRoomName, updateNewRoomName] = useState("");
    const [addingRoom, setAddingRoom] = useState(false);
    const [componentMounted, setComponentMounted] = useState(false);

    const addRoom = async (roomname) => {

        let roomData = {
            team_id: state.currentTeam.id,
            name: roomname
        }

        await actions.room.addRoom({authData: authData, roomData: roomData});
        actions.app.emitUpdateTeam();
    }

    const rateApp = async (e) => {

         let ratingData = {
            rating: e.target.dataset.value,
            user_id: state.userProfileData.id,
            user_uid: state.userProfileData.uid,
        }

        await actions.rating.createRating({authData: authData, ratingData: ratingData});
        setShowRatingModal(false);
    }

    const handleChange = async (e) => {
        updateNewRoomName(e.target.value);
    }

    useEffect(() => {

        setComponentMounted(true);

        const setActiveWin = setInterval(async () => {
            try {
            
                const activeWinAppData = await window.require("electron").ipcRenderer.sendSync('active-win');
                actions.app.setActiveWinInfo(activeWinAppData);

            } catch (error) {
                if(process.env.REACT_APP_DEV_BUILD)
                    console.log(error);
            }
        }, 2000);

        window.require("electron").ipcRenderer.on('exitUserCall', function (e, rid) {
            var room_rid = rid;
            const room = state.teamRooms.find(room => room.rid === room_rid) || {};
            actions.app.unsetUserInCall(state.userProfileData.id);
            actions.app.unsetUserInRoom({room_id: room.id, user_uid: state.userProfileData.uid});

            if(Math.random() > 0.5){
                setShowRatingModal(true);
            }
        });

        window.require("electron").ipcRenderer.send('resize-normal');
        
        return () => {
            clearInterval(setActiveWin);
            setComponentMounted(false);
        }

    }, [])

    useEffect(() => {

        let isMounted = true;

        if(isMounted){
            actions.user.getLoggedInUser({authData: authData, setAuthData: setAuthData, joinRooms: true})    
        }

        return () => { isMounted = false };

    }, [authData, actions, setAuthData])

    useEffect(() => {

        if(state.noTeams)
            history.push('/add-team');

    }, [state.noTeams, history])

    useEffect(() => {

        let isMounted = true;
        const updateeAddingRoom = () => {
             setAddingRoom(false)
        };

        window.require("electron").ipcRenderer.on('refresh', function (e, args) {
            if(isMounted){
                actions.user.getLoggedInUser({authData: authData});
                actions.team.getTeam({authData: authData, team_id: state.currentTeam.id});
            }
        });
       
       window.addEventListener('click', updateeAddingRoom);

        return () => { 
            isMounted = false;
            window.removeEventListener('click', updateeAddingRoom);
        };
    },[authData])

    const inviteModalStyle = {
        "top": "46%",
        "width": "calc(100vw - 17px)"
    }

    const ratingModalStyle = {
        "top": "calc(100vh/2 - 75px)",
        "height": "95px",
        "width": "240px",
        "left": "55px",
        "position": "absolute",
        'background': '#25272C'
    }

    return (
        <div className="w-full flex main-container">
            
            <div className="w-full ml-15 flex-1 text-white" style={{ height: "calc(100vh - 30px)" }}>
                
                <ManagementBar />

                <div className="rooms-list-container" style={{ height: "relative" }}>
                    <div className="flex justify-between items-center p-1 pl-1"
                        style={{ paddingRight: '25px', paddingBottom: '5px' }}
                    >
                        <div className="px-3 font-bold tracking-wide" style={{fontWeight: '600', color: '#C4C4C4', fontSize: '14px'}}>
                            ROOMS
                        </div>
                        
                        <button className="text-white focus:outline-none btn-add" onClick={(e) => {
                            e.stopPropagation();
                            setAddingRoom(true)
                        }}>
                        </button>
                    </div>
                    {
                        addingRoom &&
                        <div className="flex justify-center items-center hover:bg-gray-800">
                            <input className="shadow appearance-none border rounded w-full py-1 
                            px-5 text-gray-700 leading-tight focus:outline-none"
                                style={{ width: "95%" }}
                                onChange={handleChange}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                onKeyUp={(e) => {
                                    if (e.keyCode === 13 || e.which === 13) {
                                        if (e.target.value === "") {
                                            ToastNotification('error', "Room name can't be empty")
                                        } else {
                                            setAddingRoom(false);
                                            addRoom(e.target.value)
                                        }
                                    } else if(e.keyCode === 27 || e.which === 27) {

                                        setAddingRoom(false)
                                    }
                                }}
                                name="roomname"
                                id="roomname"
                                type="text"
                                placeholder="Add New Room"
                                autoFocus />
                        </div>
                    }
                    <div className="" style={{ minHeight: "80px", maxHeight: "180px", overflowY: "scroll" }}>
                        <div className='rooms-list'>
                            {
                                !state.loadingCurrentTeam && componentMounted &&
                                state.teamRooms.map((room) =>
                                    <RoomListItem
                                        room={room}
                                        key={room.id}
                                    />
                                )
                            }
                        </div>
                    </div>
                    {
                        state.teamRooms.length > 4 &&
                        <div className="center">
                            <i className="material-icons md-light md-inactive mr-2">expand_more</i>
                        </div>
                    }
                </div>

                <div className="members-list-container" style={{ height: "relative" }}>
                    <div className="flex justify-between items-center p-1 pl-1">
                        <div className="px-3 font-bold tracking-wide" style={{fontWeight: '600', color: '#BABBBE', fontSize: '14px'}}>
                            TEAM MATES
                        </div>
                    </div>
                    <div className='members-list'>
                        {
                            !state.loadingCurrentTeam &&
                            state.teamMembers.map((user) =>
                                 <UserListItem
                                    key={user.id}
                                    user={user}
                                />
                            )
                        }
                    </div>

                    {
                        state.teamMembers.length > 6 &&
                        <div className="center">
                            <i className="material-icons md-light md-inactive mr-2">expand_more</i>
                        </div>
                    }

                </div>

                <div className="pin-b pb-4 center" style={{position: 'absolute', bottom: '20px', left: 'calc(100vw/2 - 120px)'}}>
                    <div className="mt-4 px-3 w-full" style={{width: '240px', display: 'inline-block'}}>
                        <button
                            className="w-full rounded-full flex justify-center items-center bg-grey py-2 px-4 mt-2"
                            type="button"
                            style={{ transition: "all .60s ease", color: '#BABBBE' }}
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
                    showInviteModal && state.currentTeam.id ?
                        <div className="items-center absolute rounded-sm bg-white mx-2 p-1 py-1" style={inviteModalStyle}
                            onClick={(e) => {
                            }}>
                            <div className="flex w-full">
                                <h4 className="font-bold text-xl text-gray-600 text-center mb-2 flex-1"> Add Teammates</h4>
                                <h4
                                className="text-gray-600 text-center px-2 pointer"
                                onClick={() => toggleshowInviteModal(showInviteModal => !showInviteModal)}
                                > 
                                    X 
                                </h4>
                            </div>
                            <p className="text-gray-800 mb-3 text-center">
                                Share this code to add teammates to this team.
                            </p>
                            <textarea
                                rows='3'
                                id="InviteModalLink"
                                value={"Team Code: " + state.currentTeam.tid + "\nDownload App: https://github.com/Pluto-App/pluto-desktop-releases/releases"}
                                style={{ resize: 'none'}}
                                className="w-full shadow appearance-none border text-gray-200 rounded py-1 px-1 bg-gray-600"
                                readOnly
                             />
                            <button
                                className="bg-light-blue w-full rounded-sm flex justify-center text-white items-center
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

                {
                    showRatingModal &&
                    <div className="items-center absolute rounded-lg mx-1 p-1 py-1" style={ratingModalStyle}>

                        <div className="items-center px-2">
                            <p className="text-grey font-bold tracking-wide text-xs center mt-2 mb-2">
                                How was your experience?
                            </p>

                            <div className="mt-4 center rating">
                                {[5,4,3,2,1].map((x, i) =>
                                    <span
                                        className="pointer"
                                        style={{fontSize: '18px'}}
                                        data-value={x}
                                        key={x}
                                        onClick={(e) => {rateApp(e)}}
                                    >
                                      ☆
                                    </span>
                               )}
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )

}