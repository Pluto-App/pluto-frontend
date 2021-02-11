/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react'
import { useOvermind } from '../../../overmind'

import { appLogo } from '../../../utils/AppLogo';



// TODO Clear Login cache or store it in some local storage/file. => window.localStorage in electron.
// TODO Secure the Google Login. 

const ActiveWindowInfo = React.memo((props) => {


  const { state, actions } = useOvermind();
  const [activeAppInfo, setActiveAppInfo] = useState({});

  useEffect(() => {

    setActiveAppInfo(appLogo(state.usersActiveWindows[props.userId], state.userPreference));

  },[state.usersActiveWindows[props.userId]])


  return (
    <div className="pointer items-center h-6 w-6 flex overflow-hidden" 
        style={{ display: 'table', marginLeft: '10px' }}
      > 
        {
          activeAppInfo.logo?
          <a 
            style={{ display: 'table-cell', verticalAlign: 'middle', fontSize: '14px', height: props.videoOn ? '40px' : '50px' }}
            onClick={(e) => {
              //activeAppClick( e, state.usersActiveWindows[userId] )
            }}
          >
            <div>
                <img 
                    src = { activeAppInfo.logo } 
                    style = {{ borderRadius: '30%' }}
                />
            </div>
          </a>
          :
          ''
        }
          
      </div>
  );
})

export default ActiveWindowInfo;
