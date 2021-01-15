/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'


const getCursorPosition = (screenSize, cursorData) => {
    
    var x = 0;
    var y = 0;
    
    if(screenSize && cursorData) {
        x = screenSize.width * cursorData['xPercentage']
        y = screenSize.height * cursorData['yPercentage']
    }
    
    return { x: x, y: y }
}

const Cursor = React.memo((props) => {

	const { state, actions } = useOvermind();

    return (
        <span className="w-full flex" style={{ 'background-color': 'blue', 'border-radius': '50%', position: 'absolute', 
        	width: '20px', 'height': '20px',
        	left: state.screenShareCursors[props.user.id] ? 
                getCursorPosition(state.screenSize, state.screenShareCursors[props.user.id])['x'] 
                : 
                0, 

        	top: state.screenShareCursors[props.user.id] ? 
                getCursorPosition(state.screenSize, state.screenShareCursors[props.user.id])['y'] 
                : 
                0
    	}}>
    	{props.user.name}
        </span>
    )
})

export default Cursor;
