/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import * as Cookies from "js-cookie";
import ToastNotification from '../../widgets/ToastNotification';
import { socket_live, events } from '../../sockets';
import * as md5 from "md5";

const UserListItem = React.memo((props) => {

    let history = useHistory();

    const { state, actions } = useOvermind();

    const [showChatModal, toggleshowChatModal] = useState(false);
    const [showMenu, toggleShowMenu] = useState(false);

    const customMenuStyle = {
        "top": "75px",
        "height": "180px",
        "width": "230px",
        "left": "55px",
        "position": "absolute"
    }

    const customChatStyle = {
        "top": "75px",
        "height": "180px",
        "width": "230px",
        "left": "55px",
        "position": "absolute"
    }

    const removeUserHandler = async (e) => {

        if (props.id === state.userTeamDataInfo[state.activeTeamId].teamownerid) {
            ToastNotification('error', "Can't remove Owner")
            return;
        }

        if (state.userTeamDataInfo[state.activeTeamId].teamownerid === state.userProfileData.userid) {
            await actions.removeTeamMember({
                userid: props.id,
                teamid: state.activeTeamId
            })
            ToastNotification('error', props.name + " removed")
        } else {
            ToastNotification('error', "Only Owners can remove")
        }
    }

    const startVideo = () => {
        // TODO User Video Call ID. Check Needed.
        // Cannot start a VC Call with oneself.
        if(props.id !== state.userProfileData.userid) {
            let id = md5(state.activeTeamId + state.userProfileData.userid);
            Cookies.set("channel", id);
            socket_live.emit(events.video_call, {
                recieverid : props.id,
                teamid: state.activeTeamId,
                senderid : state.userProfileData.userid,
                username: state.userProfileData.username
            })
            window.require("electron").ipcRenderer.send('load-video-window', id);
            ToastNotification('success', `Initiated VC with ${props.name} 📷`);
        } else {
            ToastNotification('error', "Can't start VC with self 😠")
        }
    }

    return (
        <div className="flex py-0 justify-between p-1 pl-1 hover:bg-gray-800" id={props.id} onClick={(e) => {
            e.preventDefault();
        }}>
            <div className="flex justify-start p-2 pl-1">
                <div className="bg-white h-4 w-4 flex text-black text-2xl font-semibold rounded-lg overflow-hidden">
                    <img src={props.url} alt="T" />
                </div>
                <svg height="8" width="8">
                    <circle cx="4" cy="4" r="4" fill={props.statusColor} />
                                Sorry, your browser does not support inline SVG.
                        </svg>
                <div className="text-white px-1 font-bold tracking-wide text-xs" onClick={(e) => {
                    startVideo();
                }}>
                    {props.name}
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
                            <div className="flex justify-start">
                                <div className="bg-white h-4 w-4 flex text-black text-2xl font-semibold rounded-lg overflow-hidden">
                                    <img src={props.url} alt="T" />
                                </div>
                                <svg height="8" width="8">
                                    <circle cx="4" cy="4" r="4" fill={props.statusColor} />
                                                    Sorry, your browser does not support inline SVG.
                                            </svg>
                                <div className="text-white px-1 font-bold tracking-wide text-xs">
                                    {props.name}
                                </div>
                            </div>
                            <div className="mt-3 bg-black" style={{ height: "1px", width: "100%" }}></div>
                            <button className="w-full text-white focus:outline-none hover:bg-gray-800 rounded-lg flex font-bold tracking-wide text-xs items-center" >
                                <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>publish</i> Share Documents
                                            </button>
                            <div className="mt-3 bg-black" style={{ height: "1px", width: "100%" }}></div>
                            <button className="w-full text-white focus:outline-none hover:bg-gray-800 rounded-lg flex font-bold tracking-wide text-xs items-center" onClick={() => {
                                toggleShowMenu(false)
                                toggleshowChatModal(showChatModal => !showChatModal)
                            }}>
                                <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>question_answer</i>Instant Chat
                                            </button>
                            <div className="mt-3 bg-black" style={{ height: "1px", width: "100%" }}></div>
                            <button className="w-full text-white hover:bg-gray-800 focus:outline-none rounded-lg font-bold tracking-wide text-xs flex items-center" onClick={() => {
                                startVideo();
                            }}>
                                <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>video_call</i>Video Call
                                            </button>
                            <div className="mt-3 bg-black" style={{ height: "1px", width: "100%" }}></div>
                            <button className="w-full text-red-500 hover:bg-red-300 focus:outline-none rounded-lg font-bold tracking-wide text-xs flex items-center" onClick={(e) => {
                                removeUserHandler(e)
                            }}>
                                <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>delete_forever</i>Remove Member
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
                        <h4 className="font-bold text-xl text-gray-600 text-center mb-1"> Messenger </h4>
                        <div className="flex justify-start bg-black p-2 pl-1">
                            <div className="bg-white h-4 w-4 flex text-black text-2xl font-semibold rounded-lg overflow-hidden">
                                <img src={props.url} alt="T" />
                            </div>
                            <svg height="8" width="8">
                                <circle cx="4" cy="4" r="4" fill={props.statusColor} />
                                            Sorry, your browser does not support inline SVG.
                                    </svg>
                            <div className="text-white px-1 font-bold tracking-wide text-xs">
                                {props.name}
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
    )
})

export default UserListItem;