/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'
import Cursor from '../utility/Cursor'

const ScreenShareContainer = React.memo((props) => {

	const { state, actions } = useOvermind();

	useEffect(() => {

        const setUsersActiveWindows = setInterval(async () => {

            let usersActiveWindows = JSON.parse(localStorage.getItem("usersActiveWindows")) || {}
            let screenShareViewers = JSON.parse(localStorage.getItem("screenShareViewers")) || []
        
            actions.app.setElectronWindowActiveWinInfo(usersActiveWindows);
            actions.app.setElectronWindowScreenShareViewers(screenShareViewers);

        }, 100)

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
