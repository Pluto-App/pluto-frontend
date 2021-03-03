/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'
import Cursor from '../utility/Cursor'
import { AuthContext } from '../../context/AuthContext'


var overlaySize = {};

const ScreenShareContainer = React.memo((props) => {

	const { state, actions } = useOvermind();
    const { authData, setAuthData } = useContext(AuthContext);

	useEffect(() => {

        const setScreenShareViewers = setInterval(async () => {

            let screenShareViewers = JSON.parse(localStorage.getItem("screenShareViewers")) || []
            actions.app.setElectronWindowScreenShareViewers(screenShareViewers);

        }, 100)

        let sourceInfo = localStorage.getItem("screenshare_source");

        if(sourceInfo){
            let [sourceType, sourceId] = sourceInfo.split(':');
        
            if(sourceType === 'window'){
                const followScreenShareSource = setInterval(async () => {

                    var overlayBounds = await window.require("electron").ipcRenderer.sendSync('screenshare-source-bounds', 
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
                        
                        window.require("electron").ipcRenderer.send('update-screenshare-container-bounds',overlayBounds);
                    }

                }, 2000)    
            }    
        }

        socket_live.on(events.viewScreenShare, (data) => {
            actions.app.updateScreenShareViewers(data);
        });

        socket_live.on(events.screenShareCursor, (data) => {
            console.log('updating cursor');
            actions.app.updateScreenShareCursor(data);
        });

    },[])

    useEffect(() => {
        actions.app.setScreenSize();
    },[])

    useEffect(() => {

        actions.user.getLoggedInUser({authData: authData})

    }, [actions, authData])

    const containerStyle = {
        border: 'blue 3px solid',
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%'
    }

    return (
        <div className="screen-share-container" style={containerStyle}>

            {
                Object.keys(state.screenShareViewers).map(key => 
                    <Cursor key={key} user={state.screenShareViewers[key]}></Cursor>
                )
            }

        </div>
    )
})

export default ScreenShareContainer;
