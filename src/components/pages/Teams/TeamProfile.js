
import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../tidbits/BackButton'
import Sidebar from '../../widgets/Sidebar'
import MainBar from '../../widgets/MainBar'

export default function TeamProfile() {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    useEffect(() => {

        // Populate using POST request data from /usersbyteamid, pass teamid. Memo it.
        const MembersData = async (teamid) => {
            await actions.usersbyteamid({
                teamid : teamid
            })
        }

        MembersData("jrdf9827ds34r")

    }, [actions])

    return (
        <div className="w-full flex">
            <Sidebar></Sidebar>
            <div className="w-full bg-gray-900 ml-15 flex-1 text-white" style={{height: "calc(100vh - 30px)", marginLeft: "49px"}}>
                <MainBar/>
                <BackButton url={'/home'}></BackButton>
                <pre className="text-grey font-bold text-sm px-2 tracking-wide mt-2">
                    Team Id : {state.teamDataInfo[state.activeTeamId].id}
                </pre>
                <pre className="text-grey font-bold text-sm px-2 tracking-wide mt-2">
                    Team Name : {state.teamDataInfo[state.activeTeamId].name}
                </pre>
                <pre className="text-grey font-bold text-sm px-2 tracking-wide mt-2">
                    Team Owner : {state.teamDataInfo[state.activeTeamId].owner}
                </pre>
                <pre className="text-grey font-bold text-sm px-2 tracking-wide mt-2">
                    Team Plan : {state.teamDataInfo[state.activeTeamId].plan}
                </pre>
                <div className="w-full flex px-8 pt-6 pb-8 mb-4 items-center">
                    <div className="py-2 m-2">
                        <button
                            className="bg-green-900 hover:bg-green-700 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline rounded-full"
                            type="button"><i className="material-icons mr-1">videocam</i>
                        </button> 
                    </div>
                    <div className="py-2 m-2">
                        <button
                            className="bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-2  focus:outline-none focus:shadow-outline rounded-full"
                            type="button"> <i className="material-icons mr-1">headset_mic</i>
                        </button> 
                    </div>
                </div>
                <pre className="text-grey font-bold text-sm px-2 tracking-wide mt-2">
                   Team Members : 
                </pre>
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
        </div>
    )
}