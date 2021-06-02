/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext, useRef } from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'
import WindowShareCursor from '../utility/WindowShareCursor'
import { AuthContext } from '../../context/AuthContext'


var overlaySize = {};
const { remote, ipcRenderer } = window.require('electron');
const currentWindow = remote.getCurrentWindow();

const WindowShareContainer = React.memo((props) => {

	const { state, actions } = useOvermind();
    const { authData, setAuthData } = useContext(AuthContext);

    const [ windowShareViewers, setWindowShareViewers ] = useState({});
    const windowShareViewersRef = useRef();
    windowShareViewersRef.current = windowShareViewers;
    
	useEffect(() => {

        socket_live.emit(events.joinRoom, currentWindow.data.channel_id);

        actions.app.setScreenSize();

        let sourceInfo = localStorage.getItem("windowshare_source");

        if(sourceInfo){
        
            const followWindowShareSource = setInterval(async () => {

                var overlayBounds = await ipcRenderer.sendSync('windowshare-source-bounds', 
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
                    
                    ipcRenderer.send('update-windowshare-container-bounds',overlayBounds);
                }

            }, 200)    
        }

        socket_live.on(events.windowShareCursor, (data) => {
            if(data.user.id && (!windowShareViewersRef.current[data.user.id])){

                setWindowShareViewers({...windowShareViewers, [data.user.id] : data.user});
            }
        });

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
                Object.keys(windowShareViewers).map(user_id => 

                    <WindowShareCursor key={user_id} channel_id={currentWindow.data.channel_id} 
                        user={windowShareViewers[user_id]} remote_access={1}>
                    </WindowShareCursor>
                )
            }

        </div>
    )
})

export default WindowShareContainer;
