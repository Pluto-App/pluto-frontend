/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useOvermind } from '../../overmind';
import { socket_live, events } from '../sockets';
import Pointer from './Pointer';

const WindowShareCursor = React.memo((props) => {
  const { state, actions } = useOvermind();
  const [cursorPos, setCursorPos] = useState({});

  var cursorPosition = {
    left: props.screenDivBounds
      ? props.screenDivBounds.width * (cursorPos.xPercentage || 0)
      : cursorPos.x || 0,
    top: props.screenDivBounds
      ? props.screenDivBounds.height * (cursorPos.yPercentage || 0)
      : cursorPos.y || 0,
  };

  useEffect(() => {
    let sourceInfo = localStorage.getItem('windowshare_source');

    socket_live.emit(events.joinRoom, props.channel_id);

    socket_live.on(events.windowShareCursor, (data) => {
      if (data.user.id == props.user.id) {
        setCursorPos({
          x: data.cursor.x,
          y: data.cursor.y,
          xPercentage: data.cursor.xPercentage,
          yPercentage: data.cursor.yPercentage,
        });
        data.container = 'window';
        data.sourceInfo = sourceInfo;

        if (
          props.remote_access &&
          data.event &&
          data.event.type != 'mousemove'
        ) {
          actions.app.emitRemoteEvent({ data: data });
        }
      }
    });
  }, []);

  const cursorColor = props.user ? props.user.color : '#0000ff';
  const isCursorInWindow = cursorPos.x && cursorPos.y;
  return (
    isCursorInWindow && (
      <Pointer
        position={cursorPosition}
        label={props.user && props.user.name}
        color={cursorColor}
      ></Pointer>
    )
  );
});

export default WindowShareCursor;
