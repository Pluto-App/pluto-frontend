/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext, useRef } from 'react'
import styled from "styled-components";

import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'
import Cursor from '../utility/Cursor'
import { AuthContext } from '../../context/AuthContext'


var overlaySize = {};

const { ipcRenderer } = window.require("electron");

const ScreenShareContainer = React.memo((props) => {

	const { state, actions } = useOvermind();
    const { authData, setAuthData } = useContext(AuthContext);

    const [ screenShareViewers, setScreenShareViewers ] = useState({});
    const screenShareViewersRef = useRef();
    screenShareViewersRef.current = screenShareViewers;

	useEffect(() => {

        let sourceInfo = localStorage.getItem("screenshare_source");
        actions.app.setScreenSize();

        if(sourceInfo){
            let [sourceType, sourceId] = sourceInfo.split(':');
        
            if(sourceType === 'window'){
                const followScreenShareSource = setInterval(async () => {

                    var overlayBounds = await ipcRenderer.sendSync('screenshare-source-bounds', 
                                            sourceInfo);

                    if(overlaySize && overlayBounds) {
                        localStorage.setItem('screenshare_resolution', JSON.stringify(overlayBounds));
                        if(overlaySize.width !== overlayBounds.width || overlaySize.height !== overlayBounds.height){
                            overlaySize = {
                                width: overlayBounds.width, height: overlayBounds.height
                            };

                            socket_live.emit(events.screenShareSourceResize, {
                                call_channel_id:    localStorage.getItem("call_channel_id"),
                                resolution:         overlayBounds,
                                channel_id:         localStorage.getItem("screenshare_channel_id"),
                                sender_id:          state.userProfileData.uid
                            });
                        }
                        
                        ipcRenderer.send('update-screenshare-container-bounds',overlayBounds);
                    }

                }, 2000)    
            }    
        }

        socket_live.on(events.screenShareCursor, (data) => {

            if(data.user.id && (!screenShareViewersRef.current[data.user.id])){

                setScreenShareViewers({...screenShareViewers, [data.user.id] : data.user});
            }
        });

    },[])

    useEffect(() => {

        actions.user.getLoggedInUser({authData: authData})

    }, [actions, authData])

    const StyledContainer = styled.div`
        border: 7px solid ${({theme}) => theme.colors.sharedWindowPrimary};
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
    `
    return (
        <StyledContainer className="screen-share-container">

            {
                Object.keys(screenShareViewers).map(user_id => 
                    <Cursor key={user_id} user={screenShareViewers[user_id]}></Cursor>
                )
            }

        </StyledContainer>
    )
})

export default ScreenShareContainer;
