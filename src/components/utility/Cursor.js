/* eslint-disable no-unused-vars */
import React, {useState} from 'react'
import { useOvermind } from '../../overmind'
import { socket_live, events } from '../sockets'

const Cursor = React.memo((props) => {

    const { state } = useOvermind();
    const [ cursorPos, setCursorPos ] = useState({});

    var cursorPosition = {
        left: cursorPos.x || 0,
        top: cursorPos.y || 0,
    }

    useEffect(() => {
        
        socket_live.on(events.screenShareCursor, (data) => {
        
            if(data.user.id == props.user.id){
                setCursorPos({x: data.cursor.x, y: data.cursor.y});
                actions.app.emitRemoteEvent({ data: data});
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
            <span style={textStyle}>{props.user ? props.user.name : 'Remote User'}</span>
        </span>
    )
})

export default Cursor;
