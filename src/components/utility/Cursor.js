/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

const Cursor = React.memo((props) => {

    const { state, actions } = useOvermind();

    const cursorPosition = {
        left: props.user && state.screenShareCursors[props.user.id] ? state.screenShareCursors[props.user.id]['x'] : 0,
        top: props.user && state.screenShareCursors[props.user.id] ? state.screenShareCursors[props.user.id]['y'] - 30 : 0,
    }

    const cursorColor = props.user ? props.user.color : 'blue';

    const cursorStyle = {
        'width': '20px',
        'height': '20px',
        'left': cursorPosition['left'],
        'top': cursorPosition['top'],
        'border-radius': '50%',
        'position': 'absolute',
        'background-color': cursorColor,
        'opacity': '60%'
    }

    const arrowStyle = {
        'font-size': '20px',
        'font-weight': 'bold',
        'margin': '2px',
        'color': 'white'
    }

    const textStyle = {
        'background-color': cursorColor,
        'font-size': '11px',
        'font-weight': 'bold',
        'white-space': 'nowrap',
        'color': 'white'
    }

    return (
        <span className="w-full flex" style={cursorStyle}>
            <span class="material-icons" style={arrowStyle}>
                north_west
            </span>
            <span style={textStyle}>{props.user ? props.user.name : 'Remote User'}</span>
        </span>
    )
})

export default Cursor;
