import * as React from 'react'
import { useOvermind } from '../overmind'

const TopBar = (props) => {
  
  const { state, actions, effects, reaction } = useOvermind()

  return (
      <div style={{height: "30px", width:"100%", background:"#000" }}>
        <div className="flex justify-between items-center px-2 p-0">
        <button className="text-white cursor-pointer hover:bg-gray-800">
          <i className="material-icons md-light md-inactive" style={{ fontSize: "18px" }}> menu </i>
        </button>
        <div class="flex-1 draggable-elem" style={{ height: "30px" }}>
        </div>
        <div className="flex items-center">
          <button className="text-white hover:bg-gray-800" style= {{ marginRight: "15px" }}> 
            <i className="material-icons md-light md-inactive" style={{ fontSize: "18px", margin: "0", marginTop: "-15px" }}> minimize </i></button>
          <button className="text-white hover:bg-gray-800" >
            <i className="material-icons md-light md-inactive" style={{ fontSize: "18px", margin: "0" }}> close </i>
          </button>
        </div>
        </div>
      </div>
  );
}

export default TopBar;