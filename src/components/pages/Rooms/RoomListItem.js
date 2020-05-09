
import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import ToastNotification from '../../widgets/ToastNotification';

export default function RoomListItem(props) {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    const [showChatModal, toggleshowChatModal] = useState(false);
    const [showMenu, toggleShowMenu] = useState(false);
    const [startedEditing, updateEditStatus] = useState(false);
    const [roomName, updateRoomName] = useState(props.name);

    const clickFunc = (e) => {
        updateEditStatus(startedEditing => !startedEditing)
    }

    const customMenuStyle = {
        "top": "75px",
        "height" : "185px",
        "width": "230px",
        "left" : "55px",
        "position" : "absolute"
    }

    const customChatStyle = {
        "top": "75px",
        "height" : "185px",
        "width": "230px",
        "left" : "55px",
        "position" : "absolute"
    }

    const handleVideoCall = (e, id) => {
        //load video call window. 
        // window.require("electron").ipcRenderer.send('load-video-window', id);
    }

    const removeRoomHandler = async (e) => {
        if(state.teamDataInfo[state.activeTeamId].teamownerid === state.userProfileData.userid) {
            await actions.removeRoom({
                roomid : props.id, 
                teamid : state.activeTeamId
            }) 
            ToastNotification('error', roomName + " room removed");
        } else {
            ToastNotification('error', "Only Owners can remove")
        }
    }

    const handleClick = (e) => {
        actions.changeActiveRoom(props.id)
        ToastNotification('warn', "Added to " + roomName)
        // Emit Socket 
    }
 
    return (
        <div id={props.id} onClick={(e) => {
            handleClick(e)
        }}>
            {
                startedEditing ?
                    <div className="flex justify-center items-center hover:bg-gray-800"
                        onContextMenu={(e) => {
                            e.preventDefault();
                            clickFunc()
                        }}>
                        <input className="shadow appearance-none border rounded w-full py-1 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                                    e.target.value === '' ? alert("Text Cant be Empty !") : updateEditStatus(false)
                                    updateRoomName(e.target.value)
                                    // TODO Trigger Name Edit to database via backend
                                }
                            }}
                            type="text"
                            value={roomName}
                        autoFocus/>
                    </div>
                    :
                    <div className="flex py-0 justify-between p-1 hover:bg-gray-800" id={props.id} onContextMenu={(e) => {
                        e.preventDefault();
                        clickFunc()
                    }}>
                        <div className="flex justify-start p-2">
                            <div className="flex text-gray-500 font-semibold rounded-lg overflow-hidden">
                                <i className="material-icons md-light md-inactive hover:text-indigo-400" style={{ fontSize: "20px", margin: "0" }}>volume_up</i>
                            </div>
                            <div className="text-white px-2 font-bold tracking-wide text-xs">
                                {roomName}
                            </div>
                        </div>
                        <div className="flex">
                            {
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
                                        <button className="w-full text-white hover:bg-gray-800 focus:outline-none rounded-lg flex font-bold tracking-wide text-xs items-center" onClick={(e) => {
                                            handleVideoCall(e)
                                        }}>
                                            <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>video_call</i>Group Call
                                                </button>
                                        <div className="mt-3 bg-black" style={{ height: "1px", width: "100%" }}></div>
                                        <button className="w-full text-red-500 hover:bg-red-300 focus:outline-none rounded-lg font-bold tracking-wide text-xs flex items-center" onClick={(e) => {
                                            removeRoomHandler(e)
                                        }}>
                                            <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>delete_forever</i>Remove Room
                                                </button>
                                    </div>
                                </div>
                            }
                            <button className="text-gray-300 hover:text-indigo-500 px-1 focus:outline-none" onClick={(e) => {
                                    toggleShowMenu(showMenu => !showMenu)
                                }}>
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
}