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

const UserListItem = React.memo((props) => {

    let history = useHistory();
    const { authData } = useContext(AuthContext);

    const { state, actions } = useOvermind();

    const [showMenu, toggleShowMenu] = useState(false);
    const [activeAppInfo, setActiveAppInfo] = useState({});
    const [user, setUser] = useState(props.user);

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
        if(user.online)
            return '#5CFF59'
        else
            return '#9a9a9a'
    }

    const activeAppClick = (e, url) => {
        e.preventDefault();
        if(url && url.href){
            console.log(url);
            window.require("electron").shell.openExternal( url.href);
        }
    }

    const removeUser = async (e, user_id) => {
        e.preventDefault();
        
        var reqData = {
            team_id: state.currentTeam.id,
            user_id: user_id
        };

        await actions.team.removeUser({ authData: authData, reqData: reqData});
        history.push('/');
    }

    const startVideo = (e, receiver_uid) => {

        if (receiver_uid !== state.userProfileData.uid) {

            let channel_id = 'uvc-'+ receiver_uid + '-' + state.userProfileData.uid;

            localStorage.setItem('call_channel_id', channel_id);

            socket_live.emit(events.userVideoCall, {
                channel_id: channel_id,
                receiver: user.uid,
                sender: state.userProfileData.uid
            });

            actions.app.setUserInCall(state.userProfileData.id);

            window.require("electron").ipcRenderer.send('init-video-call-window', channel_id);

        } else {
            ToastNotification('error', "Can't start VC with self 😠")
        }
    }

    useEffect(() => {

        if(user){
            var preference = state.teamMembersMap[user.id].user_preference;
            setActiveAppInfo(appLogo(state.usersActiveWindows[user.id], preference));    
        }
        
    },[ state.usersActiveWindows[user.id]])

    useEffect(() => {

        setUser(props.user);
        
    },[ props.user])

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
                    data-tip={
                        user.uid !== state.userProfileData.uid && 
                        (state.teamMembersMap[state.userProfileData.id] && !state.teamMembersMap[state.userProfileData.id].in_call) && 
                        !user.in_call ? 
                        'Click to Talk!' : ''
                    }
                    data-place="left"
                    style={{minWidth: '100px'}}
                    onClick={(e) => {
                        if( user.uid !== state.userProfileData.uid && 
                            (state.teamMembersMap[state.userProfileData.id] && !state.teamMembersMap[state.userProfileData.id].in_call) && 
                            !user.in_call
                        )
                            startVideo(e, user.uid);
                    }}
                >
                    {user.name}
                    {user.uid === state.userProfileData.uid && ' •'}

                    {
                        user.in_call && 
                        <i className="material-icons md-light md-inactive" 
                            style={{ fontSize: "16px", paddingLeft: '2px' }}>
                            call
                        </i>
                    }
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
                        user.online && activeAppInfo.logo ? activeAppInfo.name : ''
                    } 
                </div>
                <div className="items-center h-6 w-6 flex overflow-hidden">
                    <span>
                       { user.online && activeAppInfo.logo ? 

                            <div>
                                <img
                                    alt = "" 
                                    src = { activeAppInfo.logo } 
                                    style = {{ borderRadius: '30%' }}
                                />
                            </div>
                            :
                            <div></div>
                        }
                    </span>
                </div>
            </div>
        </div>
    )
})

export default UserListItem;