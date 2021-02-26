import React from 'react'

import VideoCallTopBar from './TopBars/VideoCallTopBar'
import MainTopBar from './TopBars/MainTopBar'


// TODO Need to show some tooltip using Tailwind CSS ToolTip
const TopBar = React.memo((props) => {

  const pageHash = window.location.hash;
  var page;

  switch(pageHash) {
    case '#/video-call':
      page = 'video-call'
      break;
    default:
      page = 'main'
  }

  const videoTopBarStyle = {
    background: '#25272C',
    height: '25px'
  }

  return (
    <div 
      className='topBar' 
      style={ page === 'video-call' ? videoTopBarStyle : {}}
    >
      <div 
        className="flex justify-between items-center px-2 p-0"
        style={{width: '100%', height: '100%'}}
      >
        <div 
          className="flex-1 draggable-elem text-white font-bold center" 
          style={{width: '100%', height: '100%'}}
        >
        </div>
        
        {
          {
            'main': <MainTopBar />,
            'video-call': <VideoCallTopBar />
          }[page]
        }
      </div>
    </div>
  );
})

export default TopBar;