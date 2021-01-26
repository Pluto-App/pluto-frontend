/* eslint-disable no-unused-vars */

import React, { useEffect, useState, useContext } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import ToastNotification from '../../widgets/ToastNotification';
import * as Cookies from "js-cookie";
import * as md5 from "md5";
import { socket_live, events } from '../../sockets';

import { AuthContext } from '../../../context/AuthContext'

const RoomListItem = React.memo((room) => {

    // TODO Notify when new room created. Add to list room info.  
    let history = useHistory();
    const { authData } = useContext(AuthContext);

    const { state, actions } = useOvermind();

    const [showChatModal, toggleshowChatModal] = useState(false);
    const [showMenu, toggleShowMenu] = useState(false);
    const [startedEditing, updateEditStatus] = useState(false);
    const [roomName, updateRoomName] = useState(room.name);

    const clickFunc = (e) => {
        updateEditStatus(startedEditing => !startedEditing)
    }

    const customMenuStyle = {
        "top": "75px",
        "height": "185px",
        "width": "230px",
        "left": "55px",
        "position": "absolute"
    }

    const customChatStyle = {
        "top": "75px",
        "height": "185px",
        "width": "230px",
        "left": "55px",
        "position": "absolute"
    }

    const startVideo = (e, room_rid) => {

        // TODO User Video Call ID. Check Needed.
        // Cannot start a VC Call with oneself.

        let channel_id = room_rid;
        localStorage.setItem('call_channel_id', channel_id);

        socket_live.emit(events.roomVideoCall, {
            channel_id: state.currentTeam.tid,
            call_channel_id: channel_id,
            room_id: room.id,
            room_rid: room.rid,
            user: state.userProfileData.uid
        })

        socket_live.emit('join_room',channel_id);

        window.require("electron").ipcRenderer.send('init-mini-video-call-window', channel_id);
        //ToastNotification('success', `Initiated VC in room ${room.name} 📷`);

    }

    const removeRoomHandler = async (e) => {
        
        var roomData = {id: room.id}
        await actions.room.deleteRoom({ authData: authData, roomData: roomData})

        //ToastNotification('error', "Only Owners can remove")
    }

    const handleClick = async (e) => {
        // Change the ActiveRoomId.
        await actions.changeActiveRoom({
            roomid: room.id,
            roomname: roomName,
        })
        // Change the Room Id of the current user as well. 
        // The user switched to this room. 
        await actions.updateRoomOfMember({
            userid: state.userProfileData.userid,
            roomid: room.id
        })
        let id = md5(room.id);
        Cookies.set("channel", id);
        socket_live.emit(events.video_call, {
            recieverid: room.id,
            teamid: state.activeTeamId,
            senderid: state.userProfileData.userid,
            username: state.userProfileData.username
        })
        window.require("electron").ipcRenderer.send('load-video-window', id);
        history.push("/room-profile")
    }

    const getUserAvatar = (uid) => {

        var user = state.currentTeam.users.find(user => user.uid === uid) || {};
        return user.avatar;
    }

    return (
        <div id={room.id}>
            {
                startedEditing ?
                    <div className="flex justify-center items-center hover:bg-gray-800"
                        style={{ transition: "all .60s ease" }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            clickFunc()
                        }}>
                        <input className="shadow appearance-none border rounded w-full py-1 px-5 text-gray-700 leading-tight focus:outline-none 
                        focus:shadow-outline"
                            style={{ width: "80%" }}
                            onMouseOver={(e) => {
                                e.preventDefault()
                                e.target.select()
                            }}
                            onChange={(e) =>
                                updateRoomName(e.target.value)
                            }
                            onKeyPress={(e) => {
                                if (e.keyCode === 13 || e.which === 13) {
                                    e.target.value === '' ? ToastNotification('error', "Room Name Empty !") : updateEditStatus(false)
                                    updateRoomName(e.target.value)
                                    // TODO Trigger Name Edit to database via backend
                                }
                            }}
                            type="text"
                            value={roomName}
                            autoFocus />
                    </div>
                    :
                    <div className="flex py-0 justify-between p-1 hover:bg-gray-800" id={room.id} onContextMenu={(e) => {
                        e.preventDefault();
                        //clickFunc()
                    }}>
                        <div className="flex justify-start p-2" style={{ width: '100%'}}>
                            <div className="flex text-gray-500 font-semibold rounded-lg overflow-hidden">
                                <i className="material-icons md-light md-inactive hover:text-indigo-400" style={{ fontSize: "20px", margin: "0" }}>volume_up</i>
                            </div>
                            <div className="text-white px-2 font-bold tracking-wide text-xs" 
                                style={{width: '50%', 'white-space': 'nowrap'}}
                                onClick={(e) => {
                                    //handleClick(e)
                                }}
                            >
                                {roomName}
                            </div>
                            <div className="users-in-room-container" style={{'overflow-x': 'scroll', width: '50%', height: '20px'}} >
                                {
                                    Object.keys(state.usersInRoom[room.rid] || []).map((rid, index) => 
                                        <div className="bg-white h-5 w-5 flex text-black text-2xl font-semibold rounded-lg overflow-hidden"
                                            style={{marginRight: '5px', float: 'left'}} key={index}>
                                            <img src={getUserAvatar(rid)} />
                                        </div>
                                    )
                                }
                            </div>
                            
                        </div>
                        <div className="flex">
                            {
                                // TODO Add other Room Options if needed. 
                                showMenu &&
                                <div className="items-center absolute rounded-lg bg-black mx-1 p-1 py-1" style={customMenuStyle}>
                                    <div className="flex w-full justify-end">
                                        <i className="material-icons text-white hover:bg-gray-900 md-light md-inactive" style={{ fontSize: "20px", margin: "0" }} onClick={() => {
                                            toggleShowMenu(showMenu => !showMenu)
                                        }}>close</i>
                                    </div>
                                    <div className="items-center px-2">
                                        <p className="text-grey font-bold tracking-wide text-xs">
                                            {roomName}
                                        </p>
                                        <div className="mt-3 bg-black" style={{ height: "1px", width: "100%" }}></div>
                                        {/* 
                                        <button className="w-full text-white focus:outline-none hover:bg-gray-800 rounded-lg flex font-bold tracking-wide text-xs items-center" >
                                            <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>publish</i> Share Documents
                                                </button>
                                        <div className="mt-3 bg-black" style={{ height: "1px", width: "100%" }}></div>
                                        <button className="w-full text-white focus:outline-none hover:bg-gray-800 rounded-lg flex font-bold tracking-wide text-xs items-center" onClick={() => {
                                            toggleShowMenu(showMenu => !showMenu)
                                            toggleshowChatModal(showChatModal => !showChatModal)
                                        }}>
                                            <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>question_answer</i>Group Chat
                                                </button>
                                        <div className="mt-3 bg-black" style={{ height: "1px", width: "100%" }}></div>
                                        */}
                                        <button className="w-full text-white text-green-700 hover:bg-gray-800 focus:outline-none rounded-lg flex font-bold tracking-wide text-xs items-center" onClick={(e) => {
                                            toggleShowMenu(showMenu => !showMenu)
                                            startVideo(e,room.rid)
                                        }}>
                                            <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>video_call</i>Video Call
                                                </button>
                                        <div className="mt-3 bg-black" style={{ height: "1px", width: "100%" }}></div>
                                        <button className="w-full text-red-500 hover:bg-red-300 focus:outline-none rounded-lg font-bold tracking-wide text-xs flex items-center" onClick={(e) => {
                                            toggleShowMenu(showMenu => !showMenu)
                                            removeRoomHandler(e)
                                        }}>
                                            <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>delete_forever</i>Remove Room
                                                </button>
                                    </div>
                                </div>
                            }
                            <button className="text-gray-300 hover:text-indigo-500 px-1 focus:outline-none"
                                onClick={() => {
                                    toggleShowMenu(showMenu => !showMenu)
                                }}
                            >
                                <i className="material-icons md-light md-inactive" style={{ fontSize: "18px", margin: "0" }}>more_vert</i>
                            </button>
                            {
                                showChatModal &&
                                <div className="items-center absolute rounded-lg bg-black mx-1 p-1 py-1" style={customChatStyle}>
                                    <div className="flex w-full justify-end">
                                        <i className="material-icons text-white hover:bg-gray-900 md-light md-inactive" style={{ fontSize: "20px", margin: "0" }} onClick={() => {
                                            toggleShowMenu(false)
                                            toggleshowChatModal(showChatModal => !showChatModal)
                                        }}>close</i>
                                    </div>
                                    <h4 className="font-bold text-xl text-gray-400 text-center mb-1"> Messenger </h4>
                                    <div className="flex justify-start bg-black p-2 pl-1">
                                        <div className="text-white px-1 font-bold tracking-wide text-xs">
                                            {roomName}
                                        </div>
                                    </div>
                                    <input
                                        placeholder='Send Message'
                                        className="w-full shadow appearance-none border rounded py-1 px-2 text-gray-900 bg-gray-200"
                                    />
                                </div>
                            }
                        </div>
                    </div>
            }
        </div>
    )
})

export default RoomListItem;