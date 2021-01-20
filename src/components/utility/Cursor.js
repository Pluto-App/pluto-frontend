/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

const Cursor = React.memo((props) => {

    const { state, actions } = useOvermind();

    return (
        <span className="w-full flex" style={{ 'background-color': 'blue', 'border-radius': '50%', position: 'absolute', 
        	width: '25px', 'height': '25px',
        	left: state.screenShareCursors[props.user.id] ? state.screenShareCursors[props.user.id]['x'] : 0, 
        	top: state.screenShareCursors[props.user.id] ? state.screenShareCursors[props.user.id]['y'] : 0
    	}}>
    	{props.user.name}
        </span>
    )
})

export default Cursor;
