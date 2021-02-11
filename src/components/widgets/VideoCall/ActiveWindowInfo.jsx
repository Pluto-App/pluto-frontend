/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react'
import { useOvermind } from '../../../overmind'

import { appLogo } from '../../../utils/AppLogo';


const ActiveWindowInfo = React.memo((props) => {


  const { state, actions } = useOvermind();
  const [activeAppInfo, setActiveAppInfo] = useState({});

  const activeAppClick = (e, url) => {
      e.preventDefault();
      if(url){
          window.require("electron").shell.openExternal(url.href);
      }
  }

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
              activeAppClick( e, activeAppInfo.url )
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
