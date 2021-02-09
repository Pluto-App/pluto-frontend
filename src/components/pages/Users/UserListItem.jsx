/* eslint-disable no-unused-vars */

import React, { useEffect, useState, useContext } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import * as Cookies from "js-cookie";
import ToastNotification from '../../widgets/ToastNotification';
import ReactTooltip from 'react-tooltip';

import { socket_live, events } from '../../sockets';

import { appLogo } from '../../../utils/AppLogo';

import { AuthContext } from '../../../context/AuthContext'

import * as md5 from "md5";

const UserListItem = React.memo((user) => {

    let history = useHistory();
    const { authData } = useContext(AuthContext);

    const { state, actions } = useOvermind();

    const [showChatModal, toggleshowChatModal] = useState(false);
    const [showMenu, toggleShowMenu] = useState(false);
    const [activeAppInfo, setActiveAppInfo] = useState({});

    const logos = require.context('../../../assets/logos', true);

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

    const getStatusColor = () => {
        if(state.onlineUsers[user.id])
            return '#5CFF59'
        else
            return '#FF5959'
    }

    const getAppLogo = (appData) => {

        try {
            if(appData.owner && appData.owner.name) {

                var logo = appLogo(
                    appData.owner.name.toLowerCase().replace(/ /g,'').replace('.exe',''),
                    appData.url
                ); 

                return logo;   
            } else {
                
                throw new Error('App Data Incorrect');
            }

        } catch (error) {

            if(process.env.REACT_APP_DEV_BUILD)
                 console.log(error)

            return "https://ui-avatars.com/api/?background=black&name="   
        }
    }

    const activeAppClick = (e, url) => {
        e.preventDefault();
        if(url){
            window.require("electron").shell.openExternal(url.href);
        }
    }

    const removeUser = async (e, user_id) => {
        e.preventDefault();
        
        var reqData = {
            team_id: state.currentTeamId,
            user_id: user_id
        };

        await actions.team.removeUser({ authData: authData, reqData: reqData});
        history.push('/');
    }

    const startVideo = (e, receiver_uid) => {

        if (receiver_uid !== state.userProfileData.uid) {

            let channel_id = md5(receiver_uid + state.userProfileData.uid);

            localStorage.setItem('call_channel_id', channel_id);

            socket_live.emit(events.userVideoCall, {
                channel_id: channel_id,
                receiver: user.uid,
                sender: state.userProfileData.uid
            });
            socket_live.emit('join_room',channel_id);

            window.require("electron").ipcRenderer.send('init-video-call-window', channel_id);
            ToastNotification('success', `Initiated VC with ${user.name} 📷`);

        } else {
            ToastNotification('error', "Can't start VC with self 😠")
        }
    }

    useEffect(() => {

        setActiveAppInfo(appLogo(state.usersActiveWindows[user.id]));

    },[ state.usersActiveWindows[user.id]])

    return (
        <div className="flex py-0 justify-between p-1 pl-1 members-list-item" id={user.id} onClick={(e) => {
            e.preventDefault();
        }}>
            <ReactTooltip effect="solid" place="top" delayShow={500} />

            <div className="flex justify-start p-2 pl-1">
                <div className="h-5 w-5 flex text-black text-2xl font-semibold rounded-lg overflow-hidden"
                    style={{paddingLeft: '3px', paddingTop: '5px'}}
                >
                    <svg viewBox="0 0 6 6" height="11" width="11">
                        <circle cx="3" cy="3" r="2.5" fill={getStatusColor()} />
                            Sorry, your browser does not support inline SVG.
                    </svg>
                    <span></span>
                </div>
                <div 
                    className="text-white px-1 font-bold tracking-wide text-xs pointer" 
                    data-tip="Click to Talk ✆"
                    data-place="left"
                    style={{minWidth: '100px'}}
                    onClick={(e) => {
                        startVideo(e, user.uid);
                    }}
                >
                    {user.name}
                </div>
            </div>
            <div 
                className="items-center flex pr-2 pointer"
                data-tip={ activeAppInfo.logo && activeAppInfo.url ? 'Click to visit App.' : '' }
                style={{minWidth: '150px', placeContent: 'flex-end'}}
                onClick={(e) => {
                    activeAppClick( e, activeAppInfo.url )
                }}
            >
                <div style={{ fontSize: '12px', color: '#74767A', marginRight: '5px'}}>  
                    {
                        activeAppInfo.logo ? activeAppInfo.name : ''
                    } 
                </div>
                <div className="items-center h-6 w-6 flex overflow-hidden">
                    <a>
                       { activeAppInfo.logo ? 

                            <div>
                                <img 
                                    src = { activeAppInfo.logo } 
                                    style = {{ borderRadius: '30%' }}
                                />
                            </div>
                            :
                            <div></div>
                        }
                    </a>
                </div>

                {/*
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
                                    <img src={user.url} alt="" />
                                </div>
                                <svg height="8" width="8">
                                    <circle cx="4" cy="4" r="4" fill={user.statusColor} />
                                                    Sorry, your browser does not support inline SVG.
                                            </svg>
                                <div className="text-white px-1 font-bold tracking-wide text-xs">
                                    {user.name}
                                </div>
                            </div>
                            <div className="mt-3 bg-black" style={{ height: "1px", width: "100%" }}></div>
                            
                            {
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

                            }
                            
                            {
                                user.uid == state.userProfileData.uid ?
                                ''
                                :
                                <>
                                    <div className="mt-3 bg-black" style={{ height: "1px", width: "100%" }}></div>
                                    <button className="w-full text-white hover:bg-gray-800 focus:outline-none rounded-lg font-bold tracking-wide text-xs flex items-center" 
                                        onClick={(e) => {
                                            toggleShowMenu(showMenu => !showMenu)
                                            startVideo(e, user.uid);
                                        }}
                                    >
                                        <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>video_call</i>Video Call
                                    </button>
                                </>
                            }
                            
                            
                            <div className="mt-3 bg-black" style={{ height: "1px", width: "100%" }}></div>
                            <button className="w-full text-red-500 hover:bg-red-300 focus:outline-none rounded-lg font-bold tracking-wide text-xs flex items-center" 
                            onClick={(e) => {
                                removeUser(e, user.id)
                            }}>
                                <i className="material-icons md-light md-inactive mr-2" style={{ fontSize: "18px" }}>delete_forever</i>Remove Member
                            </button>
                        </div>
                    </div>
                */}

            {/* 
                <button className="text-gray-300 hover:text-indigo-500 px-1 focus:outline-none pointer" onClick={(e) => {
                    toggleShowMenu(showMenu => !showMenu)
                }}>
                    <i className="material-icons md-light md-inactive" style={{ fontSize: "18px", margin: "0" }}>more_vert</i>
                </button>
            */}

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
                                <img src={user.url} alt="T" />
                            </div>
                            <svg height="8" width="8">
                                <circle cx="4" cy="4" r="4" fill={user.statusColor} />
                                            Sorry, your browser does not support inline SVG.
                                    </svg>
                            <div className="text-white px-1 font-bold tracking-wide text-xs">
                                {user.name}
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