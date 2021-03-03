/* eslint-disable no-unused-vars */
import React from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

const Cursor = React.memo((props) => {

    const { state } = useOvermind();

    const cursorPosition = {
        left: props.user && state.screenShareCursors[props.user.id] ? state.screenShareCursors[props.user.id]['x'] : 0,
        top: props.user && state.screenShareCursors[props.user.id] ? state.screenShareCursors[props.user.id]['y'] : 0,
    }

    const cursorColor = props.user ? props.user.color : 'blue';

    const cursorStyle = {
        'width': '20px',
        'height': '20px',
        'left': cursorPosition['left'],
        'top': cursorPosition['top'],
        'borderRadius': '50%',
        'position': 'absolute',
        'backgroundColor': cursorColor,
        'opacity': '60%'
    }

    const arrowStyle = {
        'fontSize': '20px',
        'fontWeight': 'bold',
        'margin': '2px',
        'color': 'white'
    }

    const textStyle = {
        'backgroundColor': cursorColor,
        'fontSize': '11px',
        'fontWeight': 'bold',
        'whiteSpace': 'nowrap',
        'color': 'white'
    }

    return (
        <span className="w-full flex" style={cursorStyle}>
            <span className="material-icons" style={arrowStyle}>
                north_west
            </span>
            <span style={textStyle}>{props.user ? props.user.name : 'Remote User'}</span>
        </span>
    )
})

export default Cursor;
