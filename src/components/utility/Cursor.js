/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useOvermind } from '../../overmind';
import { socket_live, events } from '../sockets';
import Pointer from './Pointer';
const Cursor = React.memo((props) => {
  const { state, actions } = useOvermind();
  const [cursorPos, setCursorPos] = useState({});

  var cursorPosition = {
    left: cursorPos.x || 0,
    top: cursorPos.y || 0,
  };

  useEffect(() => {
    socket_live.on(events.screenShareCursor, (data) => {
      if (data.user.id == props.user.id) {
        setCursorPos({ x: data.cursor.x, y: data.cursor.y });

        if (data.event && data.event.type != 'mousemove') {
          actions.app.emitRemoteEvent({ data: data });
        }
      }
    });
  }, []);

  const cursorColor = props.user ? props.user.color : '#0000ff';

  const cursorStyle = {
    width: '120px',
    left: cursorPosition['left'],
    top: cursorPosition['top'],
    borderRadius: '50%',
    position: 'absolute',
    zIndex: '100',
    pointerEvents: 'none',
  };

  const textStyle = {
    //   b3 is added as suffix to give semi-transparent background to the user marker.
    backgroundColor: `${cursorColor}b3`,
    fontSize: '12px',
    whiteSpace: 'nowrap',
    color: 'white',
    display: 'block',
    position: 'relative',
    top: '25px',
    left: '-10px',
    padding: '3px 5px',
    textTransform: 'uppercase',
    borderRadius: '5px',
    border: `1px solid ${cursorColor}`,
  };

  return (
    <Pointer
      position={cursorPosition}
      label={props.user && props.user.name}
      color={cursorColor}
    ></Pointer>
  );
});

export default Cursor;
