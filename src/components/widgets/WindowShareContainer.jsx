/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'
import WindowShareCursor from '../utility/WindowShareCursor'
import { AuthContext } from '../../context/AuthContext'


var overlaySize = {};
const { remote } = window.require('electron');
const WindowShareContainer = React.memo((props) => {

	const { state, actions } = useOvermind();
    const { authData, setAuthData } = useContext(AuthContext);
    var currentWindow = remote.getCurrentWindow();

	useEffect(() => {

        const setWindowShareViewers = setInterval(async () => {

            let windowShareViewers = JSON.parse(localStorage.getItem("windowShareViewers") || "{}")[currentWindow.data.channel_id] || []
            actions.app.setElectronWindowShareViewers({ channel_id: currentWindow.data.channel_id, windowShareViewers: windowShareViewers});

        }, 100)

        let sourceInfo = localStorage.getItem("windowshare_source");

        if(sourceInfo){
        
            const followWindowShareSource = setInterval(async () => {

                var overlayBounds = await window.require("electron").ipcRenderer.sendSync('windowshare-source-bounds', 
                                        sourceInfo);

                if(overlaySize && overlayBounds) {
                    localStorage.setItem('windowshare_resolution', JSON.stringify(overlayBounds));
                    if(overlaySize.width !== overlayBounds.width || overlaySize.height !== overlayBounds.height){
                        overlaySize = {
                            width: overlayBounds.width, height: overlayBounds.height
                        };

                        socket_live.emit(events.windowShareSourceResize, {
                            call_channel_id:    localStorage.getItem("call_channel_id"),
                            resolution:         overlayBounds,
                            channel_id:         currentWindow.data.channel_id,
                            user_uid:           state.userProfileData.uid,
                            user_id:            state.userProfileData.id
                        });
                    }
                    
                    window.require("electron").ipcRenderer.send('update-windowshare-container-bounds',overlayBounds);
                }

            }, 2000)    
        }


        socket_live.on(events.windowShareCursor, (data) => {
            actions.app.updateWindowShareCursor({ channel_id: currentWindow.data.channel_id, data: data});
        });

    },[])

    useEffect(() => {
        actions.app.setScreenSize();
    },[])

    useEffect(() => {

        actions.user.getLoggedInUser({authData: authData})

    }, [actions, authData])

    const containerStyle = {
        border: '#434190 5px solid',
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%'
    }

    return (
        <div className="window-share-container" style={containerStyle}>

            {
                Object.keys(state.windowShareViewers[currentWindow.data.channel_id] || {} ).map(key => 

                    <WindowShareCursor key={key} channel_id={currentWindow.data.channel_id} 
                        user={(state.windowShareViewers[currentWindow.data.channel_id] || {})[key]}>
                    </WindowShareCursor>
                )
            }

        </div>
    )
})

export default WindowShareContainer;
