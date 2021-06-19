/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useOvermind } from '../../../overmind';

import { appLogo } from '../../../utils/AppLogo';

const ActiveWindowInfo = React.memo((props) => {
  const { state } = useOvermind();
  const [activeAppInfo, setActiveAppInfo] = useState({});

  const activeAppClick = (e, url) => {
    e.preventDefault();
    if (url) {
      window.require('electron').shell.openExternal(url.href);
    }
  };

  useEffect(() => {
    if (props.user) {
      setActiveAppInfo(
        appLogo(
          state.usersActiveWindows[props.user.id],
          props.user.user_preference
        )
      );
    }
  }, [state.usersActiveWindows[props.user.id]]);

  return (
    <div
      className="active-window-info pointer items-center flex overflow-hidden"
      style={{
        display: 'table',
        marginLeft: '5px',
        height: '20px',
        width: '20px',
      }}
    >
      {activeAppInfo.logo ? (
        <a
          style={{
            display: 'table-cell',
            verticalAlign: 'middle',
            fontSize: '14px',
            height: props.videoOn ? '30px' : '50px',
          }}
          onClick={(e) => {
            activeAppClick(e, activeAppInfo.url);
          }}
        >
          <div>
            <img
              alt=""
              src={activeAppInfo.logo}
              style={{ borderRadius: '30%' }}
            />
          </div>
        </a>
      ) : (
        ''
      )}
    </div>
  );
});

export default ActiveWindowInfo;
