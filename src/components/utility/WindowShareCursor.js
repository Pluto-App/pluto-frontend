/* eslint-disable no-unused-vars */
import React, {useState, useEffect} from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

const WindowShareCursor = React.memo((props) => {

    const { state, actions } = useOvermind();
    const [ cursorPos, setCursorPos ] = useState({})

    // var cursorData = state.windowShareCursors[props.channel_id + '-' + props.user.id];

    // const cursorPosition = {
    //     left: props.user && cursorData ? cursorData['x'] : 0,
    //     top: props.user && cursorData ? cursorData['y'] : 0,
    // }

    var cursorPosition = {
        left: cursorPos.x || 0,
        top: cursorPos.y || 0,
    }

    useEffect(() => {
        
        socket_live.on(events.windowShareCursor, (data) => {
        
            if(data.user.id == props.user.id){
                setCursorPos({x: data.cursor.x, y: data.cursor.y})
                actions.app.updateWindowShareCursor({ channel_id: props.channel_id, data: data});
            }
            
        });
    },[])

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
