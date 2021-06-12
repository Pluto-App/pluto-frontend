/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useOvermind } from '../../overmind';
import { socket_live, events } from '../sockets';

const Pointer = React.memo((props) => {
  const DEFAULT_CURSOR_COLOR = '#0000ff';
  const DEFAULT_CURSOR_POSITION = { left: 0, right: 0 };
  const DEFAULT_CURSOR_LABEL = 'Remote User';
  const {
    position = DEFAULT_CURSOR_POSITION,
    color = DEFAULT_CURSOR_COLOR,
    label = DEFAULT_CURSOR_LABEL,
  } = props;

  const cursorStyle = {
    width: '7.5em',
    left: position['left'],
    top: position['top'],
    borderRadius: '50%',
    position: 'absolute',
    zIndex: '100',
    pointerEvents: 'none',
  };

  const textStyle = {
    //   b3 is added as suffix to give semi-transparent background to the user marker.
    backgroundColor: `${color}b3`,
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
    border: `1px solid ${color}`,
  };

  return (
    <div className="w-full flex" style={cursorStyle}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        id="Capa_1"
        x="0px"
        y="0px"
        viewBox="0 0 512.011 512.011"
        style={{ enableBackground: 'new 0 0 512.011 512.011', width: '94px' }}
      >
        <path
          style={{ fill: color, stroke: 'white', strokeWidth: '40px' }}
          d="M434.215,344.467L92.881,3.134c-4.16-4.171-10.914-4.179-15.085-0.019  c-2.011,2.006-3.139,4.731-3.134,7.571v490.667c0.003,4.382,2.685,8.316,6.763,9.92c4.081,1.603,8.727,0.545,11.712-2.667  l135.509-145.92h198.016c5.891,0.011,10.675-4.757,10.686-10.648C437.353,349.198,436.226,346.473,434.215,344.467z"
        />
      </svg>
      <span style={textStyle}>{label ? label : 'Remote User'}</span>
    </div>
  );
});

export default Pointer;
