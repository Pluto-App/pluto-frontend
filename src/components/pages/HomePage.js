import React from 'react'
import Sidebar from '../widgets/Sidebar'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"
import MainBar from "../widgets/MainBar"
import UserListItem from "./tidbits/UserListItem"
import RoomListItem from "./tidbits/RoomListItem"

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
                    <RoomListItem id={"6322147"} url={"https://gravatar.com/avatar/6a36a53c51c57afc033dbf1bb0529dda?s=400&d=robohash&r=x"} name={"Daily Stand Up"} />
                    <RoomListItem id={"9965124"} url={"https://gravatar.com/avatar/4df79c0cb57ed430c7fca7eff845f8a2?s=400&d=robohash&r=x"} name={"War Room"} />
                    <RoomListItem id={"1145255"} url={"https://gravatar.com/avatar/c04ac69cdd3046e6be2df57b0b54b645?s=400&d=robohash&r=x"} name={"Cooler Side-Talks "} />
                </div>

                <div className="sidebar-icons" style={{height: "relative"}}>
                    <div className="flex justify-between items-center p-2 pl-3 hover:bg-gray-800">
                        <div className="text-white font-bold tracking-wide text-xs">Online Members : </div>
                    </div>
                    <UserListItem id={'74554'} url={'https://gravatar.com/avatar/6a36a53c51c57afc033dbf1bb0529dda?s=400&d=robohash&r=x'} name={"Puneet Acharya"} statusColor={'red'}/>
                    <UserListItem id={'99654'} url={'https://gravatar.com/avatar/2186b975d2d8ac084397b3fe1a42795d?s=400&d=robohash&r=x'} name={"Chris Chan"} statusColor={'orange'}/>
                    <UserListItem id={'73214'} url={'https://gravatar.com/avatar/a6cb3d209b64a8524ef80d93f18f7bf8?s=400&d=robohash&r=x'} name={"Abhishek Wani"} statusColor={'green'}/>
                    <UserListItem id={'66254'} url={state.userProfileData.profilePictureUrl} name={"Sumit Lahiri"} statusColor={'green'}/>
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
        </div>
    )
    
}
