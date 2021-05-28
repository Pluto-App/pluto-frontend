/* eslint-disable no-unused-vars */
import React from 'react'
import { useOvermind } from '../../overmind'

const WindowShareCursor = React.memo((props) => {

    const { state } = useOvermind();

    var cursorData = state.windowShareCursors[props.channel_id + '-' + props.user.id];

    const cursorPosition = {
        left: props.user && cursorData ? cursorData['x'] : 0,
        top: props.user && cursorData ? cursorData['y'] : 0,
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
            <span style={textStyle}>
                {props.user ? props.user.name : 'Remote User'}
            </span>
        </span>
    )
})

export default WindowShareCursor;
