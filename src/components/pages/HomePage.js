import React from 'react'
import Sidebar from '../widgets/Sidebar'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"
import MainBar from "../widgets/MainBar"

export default function HomePage() {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

 
    const customStyle = {
        "top": "30%",
        "width": "100%  box-shadow: 0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)"
    }

    return (
        <div className="w-full flex">
            <Sidebar></Sidebar>
            <div className="w-full bg-gray-900 ml-15 flex-1 text-white" style={{height: "calc(100vh - 30px)", marginLeft: "49px"}}>
                <MainBar/>
                <div className="sidebar-icons" style={{height: "relative"}}>
                    <div className="flex justify-between items-center p-2 pl-3 hover:bg-gray-700">
                        <div className="text-white font-bold tracking-wide text-xs">Team Rooms : </div>
                    </div>
                    <div className="flex py-0 justify-between p-2 pl-3 hover:bg-gray-700">
                        <div className="flex justify-start p-2 pl-3">
                            <div className="bg-white h-5 w-5 flex text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                <img src="https://gravatar.com/avatar/6a36a53c51c57afc033dbf1bb0529dda?s=400&d=robohash&r=x" alt="T" />
                            </div>
                            <div className="text-white px-2 font-bold tracking-wide text-xs">
                                Daily Stand Up 
                            </div>
                        </div>
                        <button className="text-white">
                            <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>add</i>
                        </button>
                    </div>
                    <div className="flex py-0 justify-between p-2 pl-3 hover:bg-gray-700">
                        <div className="flex justify-start p-2 pl-3">
                            <div className="bg-white h-5 w-5 flex text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                <img src="https://gravatar.com/avatar/4df79c0cb57ed430c7fca7eff845f8a2?s=400&d=robohash&r=x" alt="T" />
                            </div>
                            <div className="text-white px-2 font-bold tracking-wide text-xs">
                                War Room  
                            </div>
                        </div>
                        <button className="text-white">
                            <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>add</i>
                        </button>
                    </div>
                    <div className="flex py-0 justify-between p-2 pl-3 hover:bg-gray-700">
                        <div className="flex justify-start p-2 pl-3">
                            <div className="bg-white h-5 w-5 flex text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                <img src="https://gravatar.com/avatar/c04ac69cdd3046e6be2df57b0b54b645?s=400&d=robohash&r=x" alt="T" />
                            </div>
                            <div className="text-white px-2 font-bold tracking-wide text-xs">
                                Cooler Side-Talks 
                            </div>
                        </div>
                        <button className="text-white">
                            <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>add</i>
                        </button>
                    </div>
                </div>
                <div className="sidebar-icons" style={{height: "relative"}}>
                    <div className="flex justify-between items-center p-2 pl-3 hover:bg-gray-800">
                        <div className="text-white font-bold tracking-wide text-xs">Online Members : </div>
                    </div>
                    <div className="flex py-0 justify-between p-2 pl-3 hover:bg-gray-800">
                        <div className="flex justify-start p-2 pl-3">
                            <div className="bg-white h-4 w-4 flex text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                <img src="https://gravatar.com/avatar/6a36a53c51c57afc033dbf1bb0529dda?s=400&d=robohash&r=x" alt="T" />
                            </div>
                            <div className="text-white px-2 font-bold tracking-wide text-xs">
                                Puneet Acharya 
                            </div>
                            <svg height="10" width="10">
                                    <circle cx="5" cy="5" r="4" fill="green" />
                            </svg>
                        </div>
                        <button className="text-white">
                            <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>add</i>
                        </button>
                    </div>
                    <div className="flex py-0 justify-between p-2 pl-3 hover:bg-gray-800">
                        <div className="flex justify-start p-2 pl-3">
                            <div className="bg-white h-4 w-4 flex text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                <img src="https://gravatar.com/avatar/2186b975d2d8ac084397b3fe1a42795d?s=400&d=robohash&r=x" alt="T" />
                            </div>
                            <div className="text-white px-2 font-bold tracking-wide text-xs">
                                Chris Chan 
                            </div>
                            <svg height="10" width="10">
                                    <circle cx="5" cy="5" r="4" fill="green" />
                            </svg>
                        </div>
                        <button className="text-white">
                            <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>add</i>
                        </button>
                    </div>
                    <div className="flex py-0 justify-between p-2 pl-3 hover:bg-gray-800">
                        <div className="flex justify-start p-2 pl-3">
                            <div className="bg-white h-4 w-4 flex text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                <img src="https://gravatar.com/avatar/a6cb3d209b64a8524ef80d93f18f7bf8?s=400&d=robohash&r=x" alt="T" />
                            </div>
                            <div className="text-white px-2 font-bold tracking-wide text-xs">
                                Abhishek Wani 
                            </div>
                            <svg height="10" width="10">
                                    <circle cx="5" cy="5" r="4" fill="green" />
                            </svg>
                        </div>
                        <button className="text-white">
                            <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>add</i>
                        </button>
                    </div>
                    <div className="flex py-0 justify-between p-2 pl-3 hover:bg-gray-800">
                        <div className="flex justify-start p-2 pl-3">
                            <div className="bg-white h-4 w-4 flex text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                <img src={state.userProfileData.profilePictureUrl} alt="T" />
                            </div>
                            <div className="text-white px-2 font-bold tracking-wide text-xs">
                                Sumit Lahiri 
                            </div>
                            <svg height="10" width="10">
                                    <circle cx="5" cy="5" r="4" fill="green" />
                            </svg>
                        </div>
                        <button className="text-white">
                            <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>add</i>
                        </button>
                    </div>
                </div>
                <div className="absolute pin-b pb-4" style={{width: "calc(95% - 50px)"}}>
                    <div className="mt-4 px-3 w-full">
                        <button 
                            className="bg-purple-700 w-full rounded-full flex justify-center items-center hover:bg-purple-500 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                            type="button">
                            <i class="material-icons md-light md-inactive mr-2">person_add</i>Invite Teammates
                        </button>
                    </div>
                </div>
                </div>

                {/* <div class="items-center absolute rounded-sm bg-white mx-2 p-2 py-4" style={customStyle}>
                    <h4 class="font-bold text-xl text-center mb-2">Invite Teammates to<br/>Pluto Office App</h4>
                        <p class="text-grey-darker mb-3 text-center">
                            Share this link with others to grant access to this team.
                        </p>
                    <input value="https://onyomark.com/asd234" class="w-full shadow appearance-none border rounded py-2 px-3 text-grey-darkest bg-grey" />
                    <button 
                        class="bg-purple w-full rounded-sm flex justify-center items-center hover:bg-purple-dark text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                        type="button"
                    >Copy Invite</button>
                </div> */}
        </div>
    )
    
}
