/* eslint-disable no-unused-vars */
import React, {useState, useEffect} from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

const WindowShareCursor = React.memo((props) => {

    const { state, actions } = useOvermind();
    const [ cursorPos, setCursorPos ] = useState({})

    var cursorPosition = {
        left: cursorPos.x || 0,
        top: cursorPos.y || 0,
    }

    useEffect(() => {

        let sourceInfo = localStorage.getItem("windowshare_source");

        socket_live.emit(events.joinRoom, props.channel_id);
        
        socket_live.on(events.windowShareCursor, (data) => {
        
            if(data.user.id == props.user.id){
                setCursorPos({x: data.cursor.x, y: data.cursor.y});
                data.container = 'window';
                data.sourceInfo = sourceInfo;

                if(props.remote_access && data.event && data.event.type != 'mousemove'){
                    actions.app.emitRemoteEvent({ data: data});    
                }
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
        'opacity': '60%',
        zIndex: '100',
        pointerEvents: 'none'
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
        <span className="w-full flex windowshare-cursor" style={cursorStyle}>
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
