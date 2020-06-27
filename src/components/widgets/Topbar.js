import * as React from 'react'
import { useOvermind } from '../../overmind'
const { remote } = window.require('electron');

// TODO Need to show some tooltip using Tailwind CSS ToolTip
export default function TopBar(props) {

  const { actions } = useOvermind();

  const minimize = () => {
    var window = remote.getCurrentWindow();
    // TODO Emit user is away/sleeping mode. 
    window.minimize();
  }

  const close = () => {
    // TODO need to close all windows here. 
    var window = remote.getCurrentWindow();
    if (window.title === "MainWindow") 
      actions.handleLogout()
    window.close();
  }

  return (
    <div className="topBar" style={{ height: "30px", width: "100%", background: "#000" }}>
      <div className="flex justify-between items-center px-2 p-0">
        <button className="text-white cursor-pointer hover:bg-gray-800">
          <i className="material-icons md-light md-inactive" style={{ fontSize: "18px" }}> menu </i>
        </button>
        <div className="flex-1 draggable-elem text-white font-bold" style={{ height: "30px" }}>
        </div>
        <div className="flex items-center">
          <button className="text-white hover:bg-gray-800" style={{ marginRight: "15px" }}>
            <i className="material-icons md-light md-inactive" onClick={() => { minimize() }} style={{ fontSize: "18px", margin: "0", marginTop: "-15px" }}> minimize </i></button>
          <button className="text-white hover:bg-gray-800" >
            <i className="material-icons md-light md-inactive" onClick={() => { close() }} style={{ fontSize: "18px", margin: "0" }}> close </i>
          </button>
        </div>
      </div>
    </div>
  );
}