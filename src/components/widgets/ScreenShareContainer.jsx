/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'
import Cursor from '../utility/Cursor'
import { AuthContext } from '../../context/AuthContext'

const ScreenShareContainer = React.memo((props) => {

	const { state, actions } = useOvermind();
    const { authData, setAuthData } = useContext(AuthContext);

	useEffect(() => {

        const setScreenShareViewers = setInterval(async () => {

            let screenShareViewers = JSON.parse(localStorage.getItem("screenShareViewers")) || []
            actions.app.setElectronWindowScreenShareViewers(screenShareViewers);

        }, 100)

        socket_live.on(events.viewScreenShare, (data) => {
            console.log('updateScreenShareViewers');
            //alert('updateScreenShareViewers')
            actions.app.updateScreenShareViewers(data);
        });

        socket_live.on(events.screenShareCursor, (data) => {
            console.log('updateScreenShareCursor');
            actions.app.updateScreenShareCursor(data);
        });

    }, [])

    useEffect(() => {
        actions.app.setScreenSize();
    }, [])

     useEffect(() => {

        actions.user.getLoggedInUser({authData: authData})

    }, [actions, authData])

    const containerStyle = {
        border: 'blue 2px solid',
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%'
    }

    return (
        <div className="screen-share-container" style={containerStyle}>

            {
                Object.keys(state.screenShareViewers).map(key => 
                    <Cursor user={state.screenShareViewers[key]}></Cursor>
                )
            }

        </div>
    )
})

export default ScreenShareContainer;
