/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'
import Cursor from '../utility/Cursor'

const ScreenShareContainer = React.memo((props) => {

	const { state, actions } = useOvermind();

	useEffect(() => {

        const setUsersActiveWindows = setInterval(async () => {

            let screenShareViewers = JSON.parse(localStorage.getItem("screenShareViewers")) || []
            let screenShareCursors = JSON.parse(localStorage.getItem("screenShareCursors")) || []
        
            actions.app.setElectronWindowScreenShareViewers(screenShareViewers);
            actions.app.setElectronWindowScreenShareCursors(screenShareCursors);

        }, 100)

    }, [])

    useEffect(() => {
        actions.app.setScreenSize();
    }, [])

    return (
        <div className="w-full flex" style={{ border: 'blue 1px solid', position: 'absolute', top: 0, bottom: 0}}>

            {
                Object.keys(state.screenShareViewers).map(key => 
                    <Cursor user={state.screenShareViewers[key]}></Cursor>
                )
            }

        </div>
    )
})

export default ScreenShareContainer;
