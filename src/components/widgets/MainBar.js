import React from 'react'
import Sidebar from '../widgets/Sidebar'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"

export default function MainBar() {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    return (
            <div className="w-full flex">
                <div className="relative" style={{height: "35px", width: "100%", background:"#000"}}>
                    <div className="flex justify-between items-center px-2 p-0">
                        <p 
                            onClick="" // listOpen Toggle
                            className="flex p-1 items-center text-grey-dark font-bold rounded-lg hover:text-white cursor-pointer hover:bg-grey-darker">
                                {state.teamDataInfo[state.activeTeamId].name}
                        </p>
                        <div className="flex items-center">
                            <button className="text-white hover:bg-grey-darker rounded-lg p-1"  onClick={(e) => {
                                e.preventDefault();
                                history.push('/team-profile')
                            }}>
                                <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>settings</i>
                            </button>
                            <button className="text-white hover:bg-grey-darker rounded-lg p-1" >
                                <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>center_focus_strong</i>
                            </button>
                            <a href="/user-profile" onClick={(e) => {
                                e.preventDefault();
                                history.push('/user-profile')
                            }} className="flex items-center text-grey rounded-lg  px-1 py-1  no-underline cursor-pointer hover:bg-grey-darker">
                                <div className="bg-white h-6 w-6 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                    <img src={state.userProfileData.picture} alt="" />
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
    )
    
}
