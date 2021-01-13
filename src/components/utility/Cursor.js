/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

const Cursor = React.memo((props) => {

	const { state, actions } = useOvermind();

	useEffect(() => {

		if(state.usersActiveWindows[props.user]) {
			
			//console.log(state.usersActiveWindows[props.user].cursor);
				
		}

	},[state.usersActiveWindows[props.user]])

    return (
        <span className="w-full flex" style={{ 'background-color': 'blue', 'border-radius': '50%', position: 'absolute', 
        	width: '25px', 'height': '25px',
        	left: state.usersActiveWindows[props.user] ? state.usersActiveWindows[props.user].cursor['x'] : 0, 

        	top: state.usersActiveWindows[props.user] ? state.usersActiveWindows[props.user].cursor['y'] : 0
    	}}>
        </span>
    )
})

export default Cursor;
