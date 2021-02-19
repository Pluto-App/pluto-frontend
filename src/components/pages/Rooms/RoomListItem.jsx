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

const RoomListItem = React.memo((props) => {

    // TODO Notify when new room created. Add to list room info.  
    let history = useHistory();
    const { authData } = useContext(AuthContext);

    const { state, actions } = useOvermind();
    const [room, setRoom] = useState(props.room);

    const [showMenu, toggleShowMenu] = useState(false);
    const [startedEditing, updateEditStatus] = useState(false);
    const [roomName, updateRoomName] = useState(room.name);
    const [hoverState, setHoverState] = useState(false);
    const [activeAppInfo, setActiveAppInfo] = useState({});

    useEffect(() => {

        const setActiveWin = setInterval(async () => {
            
            var usersInRoom = room.users || [];
            var userUid = usersInRoom[Math.floor(Math.random() * usersInRoom.length)];
            var user = (state.teamMembers || []).find(user => user.uid === userUid);
            var appData = state.usersActiveWindows[user ? user.id : undefined];

            setActiveAppInfo(appLogo(appData, state.userPreference));
        }, 5000)
        
        return () => clearInterval(setActiveWin);

    },[])

    useEffect(() => {

        setRoom(props.room);
        
    },[ props.room ])

    const toggleEditRoomName = (e) => {
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

    const startVideo = async (e, room_rid) => {

        if(localStorage.getItem('call_channel_id'))
            await actions.app.clearVideoCallData();

        let channel_id = 'rvc-' + room_rid;
        localStorage.setItem('call_channel_id', channel_id);

        socket_live.emit(events.roomVideoCall, {
            channel_id: 't-' + state.currentTeam.tid,
            call_channel_id: channel_id,
            room_id: room.id,
            room_rid: room.rid,
            user: state.userProfileData.uid
        })

        window.require("electron").ipcRenderer.send('init-video-call-window', channel_id);
    }

    const updateRoom = async (name) => {
        
        var roomData = {id: room.id, name: name}
        await actions.room.updateRoom({ authData: authData, roomData: roomData})

        //ToastNotification('error', "Only Owners can remove")
    }

    const removeRoomHandler = async (e) => {
        
        var roomData = {id: room.id}
        await actions.room.deleteRoom({ authData: authData, roomData: roomData})
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

    const userAvatar = (uid) => {
        var userInfo = state.teamMembers.find(user => user.uid === uid);

        return userInfo ? userInfo.avatar : '';
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
                            toggleEditRoomName()
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
                    <div className="flex py-0 justify-between p-1" id={room.id} 
                        style={{ 
                            background: (!room.users ||
                                                !(room.users.includes(state.userProfileData.uid))) ? '' : '#202225'
                        }}
                    >
                        <div className="flex justify-start p-2" style={{ width: '100%'}}>
                            {
                                Object.keys(room.users || []).length > 0 && activeAppInfo.logo ?

                                <div className="flex" 
                                    style={{
                                        width: '30px', 
                                        height: '30px', 
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
                                        style={{ fontSize: "16px", position: 'relative', right: '15px', top: '20px', color: '#BABBBE', 
                                            background: '#36383D', height: '20px', minWidth: '20px', borderRadius: '50%', 
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
                            >   
                                <span 
                                    onClick={(e) => {
                                        if(!state.teamMembersMap[state.userProfileData.id].in_call)
                                            startVideo(e, room.rid)
                                    }}
                                >
                                    {roomName}
                                </span>
                                
                                {
                                     hoverState &&
                                     <i 
                                        className="material-icons md-light md-inactive ml-2"
                                        style={{fontSize: '14px'}}
                                        onClick={(e) => {
                                            toggleEditRoomName(e)
                                        }}
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
                                    !state.teamMembersMap[state.userProfileData.id].in_call &&
                                    <button className="text-white focus:outline-none bg-light-blue btn-join-room" 
                                        style={{width: '60px', fontSize: '14px'}}
                                        onClick={(e) => {
                                            startVideo(e,room.rid);
                                        }}
                                    >
                                        Join
                                    </button>
                                }
                                

                                <button className="text-gray-300 hover:text-indigo-500 px-1 focus:outline-none"
                                    onClick={() => {
                                        toggleShowMenu(showMenu => !showMenu)
                                    }}
                                >
                                    <i className="material-icons md-light md-inactive" style={{ fontSize: "18px", margin: "0" }}>delete_forever</i>
                                </button>
                            </div>    
                        }

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
                        
                    </div>


            }
            {
                (room.users || []).length > 0 &&
                <div className="flex px-3 p-2" 
                    style={{}}
                >   
                    {
                        (room.users || []).map((uid) => 
                            
                            <div key={uid} style={{width: '25px', marginRight: '10px'}}>
                                
                                <img src={
                                    userAvatar(uid)
                                } style={{width: '100%', borderRadius: '12px'}} />
                                
                            </div>
                        )
                    }
                </div>
            }
            
        </div>
    )
})

export default RoomListItem;
