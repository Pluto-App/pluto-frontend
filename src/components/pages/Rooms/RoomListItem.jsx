/* eslint-disable no-unused-vars */

import React, { useEffect, useState, useContext } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import ToastNotification from '../../widgets/ToastNotification';
import * as Cookies from "js-cookie";
import * as md5 from "md5";
import { socket_live, events } from '../../sockets';

import { appLogo } from '../../../utils/AppLogo';

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
    const [hoverState, setHoverState] = useState(false);
    const [activeAppInfo, setActiveAppInfo] = useState({});

    useEffect(() => {
        actions.room.getUsersInRoom({authData: authData, roomId: room.id});
    },[])

    useEffect(() => {

        const setActiveWin = setInterval(async () => {
            
            var usersInRoom = state.usersInRoom[room.rid] || [];
            var userUid = usersInRoom[Math.floor(Math.random() * usersInRoom.length)];
            var user = state.currentTeam.users.find(user => user.uid === userUid);
            var appData = state.usersActiveWindows[user ? user.id : undefined];

            setActiveAppInfo(appLogo(appData));
        }, 5000)
        
        return () => clearInterval(setActiveWin);

    },[])

    const clickFunc = (e) => {
        updateEditStatus(startedEditing => !startedEditing)
    }

    const customMenuStyle = {
        "top": "75px",
        "height": "105px",
        "width": "240px",
        "left": "55px",
        "position": "absolute",
        'background': '#25272C'
    }

    const customChatStyle = {
        "top": "75px",
        "height": "125",
        "width": "225px",
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

        window.require("electron").ipcRenderer.send('init-video-call-window', channel_id);
        //ToastNotification('success', `Initiated VC in room ${room.name} 📷`);
    }

    const updateRoom = async (name) => {
        
        var roomData = {id: room.id, name: name}
        await actions.room.updateRoom({ authData: authData, roomData: roomData})

        //ToastNotification('error', "Only Owners can remove")
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

    return (
        <div id={room.id} className="room-list-item"
            onMouseEnter={(e) => {
                setHoverState(true);
            }}
            onMouseLeave={(e) => {
               setHoverState(false);
            }}
        >
            {
                startedEditing ?
                    <div className="flex justify-center items-center"
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
                            onKeyUp={(e) => {
                                if (e.keyCode === 13 || e.which === 13) {
                                    e.target.value === '' ? ToastNotification('error', "Room Name Empty !") : updateEditStatus(false)
                                    updateRoomName(e.target.value)
                                    updateRoom(e.target.value)
                                } else if(e.keyCode === 27 || e.which === 27) {

                                    updateEditStatus(false);
                                }
                            }}
                            type="text"
                            value={roomName}
                            autoFocus />
                    </div>
                    :
                    <div className="flex py-0 justify-between p-1" id={room.id} >
                        <div className="flex justify-start p-2" style={{ width: '100%'}}>
                            {
                                Object.keys(state.usersInRoom[room.rid] || []).length > 0 && activeAppInfo.logo ?

                                <div className="flex" 
                                    style={{
                                        width: '40px', 
                                        height: '40px', 
                                        overflow: 'visible', 
                                        background: '#2F3136',
                                        borderRadius: '30%'
                                    }}
                                >
                                    <img 
                                        src={ activeAppInfo.logo } 
                                        style={{width: '40px', borderRadius: '30%'}} 
                                    />
                                    
                                    <i className="material-icons md-light md-inactive" 
                                        style={{ fontSize: "16px", position: 'relative', right: '15px', top: '25px', color: '#BABBBE', 
                                            background: '#134DDF', height: '20px', minWidth: '20px', borderRadius: '50%', 
                                            paddingLeft: '2px', paddingTop: '2px' }}>
                                        volume_up
                                    </i>
                                </div>
                                :
                                <div className="flex" >
                                    
                                    <i className="material-icons md-light md-inactive" 
                                        style={{ fontSize: "20px", color: '#BABBBE', 
                                            height: '20px', minWidth: '20px', borderRadius: '50%', 
                                            paddingLeft: '2px', paddingTop: '2px', paddingRight: '20px' }}>
                                        volume_up
                                    </i>
                                </div>    
                            }
                            

                            <div className="text-white px-2 font-bold tracking-wide text-xs pointer" 
                                style={{ whiteSpace: 'nowrap', fontSize: '14px', minHeight: '30px'}}
                                onClick={(e) => {
                                    clickFunc(e)
                                }}
                            >   
                                {roomName}

                                {
                                     hoverState &&
                                     <i 
                                        className="material-icons md-light md-inactive ml-2"
                                        style={{fontSize: '14px'}}
                                    >
                                        edit
                                    </i>
                                }
                            </div>

                        </div>

                        {
                            hoverState &&   
                            <div className="flex" style={{ padding: '5px'}}>
                                {
                                   showMenu &&
                                    <div className="items-center absolute rounded-lg mx-1 p-1 py-1" style={customMenuStyle}>

                                        <div className="items-center px-2">
                                            <p className="text-grey font-bold tracking-wide text-xs center mt-2 mb-2">
                                                Remove {roomName} ?
                                            </p>

                                            <div className="flex">
                                                <button
                                                className="rounded-full flex justify-center items-center bg-green-700
                                                text-white py-2 px-4 mt-2 mr-2 focus:outline-none focus:shadow-outline"
                                                type="button"
                                                style={{ transition: "all .60s ease", fontSize: '14px' }}
                                                onClick={(e) => {
                                                    toggleShowMenu(showMenu => !showMenu)
                                                    removeRoomHandler(e)
                                                }}>
                                                    <i 
                                                        className="material-icons md-light md-inactive mr-2"
                                                        style={{fontSize: '18px'}}
                                                    >
                                                        check
                                                    </i> Confirm
                                                </button>

                                                <button
                                                className="rounded-full flex justify-center items-center bg-red-700
                                                text-white py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                                                type="button"
                                                style={{ transition: "all .60s ease", fontSize: '14px' }}
                                                onClick={() => {
                                                    toggleShowMenu(showMenu => !showMenu)
                                                }}>
                                                     <i 
                                                        className="material-icons md-light md-inactive mr-2"
                                                        style={{fontSize: '18px'}}
                                                    >
                                                        close
                                                    </i> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                }
                                <button className="text-white focus:outline-none btn-join-room" 
                                    style={{width: '60px', fontSize: '14px'}}
                                    onClick={(e) => {
                                        startVideo(e,room.rid);
                                    }}
                                >
                                    Join
                                </button>

                                <button className="text-gray-300 hover:text-indigo-500 px-1 focus:outline-none"
                                    onClick={() => {
                                        toggleShowMenu(showMenu => !showMenu)
                                    }}
                                >
                                    <i className="material-icons md-light md-inactive" style={{ fontSize: "18px", margin: "0" }}>delete_forever</i>
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
                        }
                        
                    </div>


            }
             <div className="flex" 
                style={{paddingLeft: '60px', position: 'relative', top: '-10px'}}
                onClick={(e) => {
                    //handleClick(e)
                }}
            >   
                {
                    (state.usersInRoom[room.rid] || []).map((uid) => 
                        
                        <div key={uid} style={{width: '30px', marginRight: '10px'}}>
                            
                            <img src={
                                state.currentTeam.users.find(user => user.uid === uid).avatar
                                
                            } style={{width: '100%', borderRadius: '15px'}} />
                            
                        </div>
                    )
                }
            </div>
        </div>
    )
})

export default RoomListItem;
