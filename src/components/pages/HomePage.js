import React from 'react'
import Sidebar from '../widgets/Sidebar'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"

export default function HomePage() {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    const logout = (e) => {
        e.preventDefault();
        actions.handleLogout().then(() => {
            window.require("electron").ipcRenderer.send('resize-login');
            history.push('/');
        }); 
    }

    return (
        <div className="w-full flex">
            <Sidebar avatarArray={state.avatarArray}></Sidebar>
            <div className="w-full bg-gray-900 ml-15 flex-1 text-white" style={{height: "calc(100vh - 30px)", marginLeft: "49px"}}>
                <div className="relative" style={{height: "33px", width: "100%", background:"#000"}}>
                    <div className="flex justify-between items-center px-2 p-0">
                        <button 
                            onClick="" // listOpen Toggle
                            className="flex p-1 items-center text-grey-dark font-bold rounded-lg hover:text-white cursor-pointer hover:bg-grey-darker">Pluto Office
                            <i className="material-icons md-light md-inactive" style={{fontSize: "18px"}}>unfold_more</i>
                        </button>
                        <div className="flex items-center">
                            <button className="text-white hover:bg-grey-darker rounded-lg p-1" >
                                <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>center_focus_strong</i>
                            </button>
                            <a href="/user-profile" onClick="" className="flex items-center text-grey rounded-lg  px-1 py-1  no-underline cursor-pointer hover:bg-grey-darker">
                                <div className="bg-white h-4 w-4 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                    <img src="https://i.pravatar.cc/300?u=a042581f4e29026704d" alt="" />
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="sidebar-icons">
                    <div className="flex justify-between items-center p-2 pl-3">
                        <div className="text-white font-bold tracking-wide text-xs">ROOMS</div>
                            <button className="text-white">
                                <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>add</i>
                            </button>
                        </div>
                    </div>
                </div>
        </div>
    )
    
}
