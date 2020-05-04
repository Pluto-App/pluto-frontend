import React, { useEffect, useState } from 'react'
import Sidebar from '../widgets/Sidebar'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"
import MainBar from "../widgets/MainBar"
import UserListItem from "./tidbits/UserListItem"
import RoomListItem from "./tidbits/RoomListItem"

export default function HomePage() {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    const [OnlineMembersArray, updateOnlineMembersArray] = useState([]);
    const [TeamRoomsArray, updateTeamsRoomsArray] = useState([]);

    const toggleModalItem = (e) => {
        // Open model for Showing magic link for adding new team members.
        // https://pluto-office.herokuapp.com/bymglnk/nfc03f898jf3
    }

    useEffect(() => {
        
        const getTeamRooms = (teamid) => {
            // Populate TeamRoomsArray array here from Team Id
        }
        
        let RoomListArray = [
            {
                id : 55486464,
                url : 'https://picsum.photos/id/1/200/300',
                name : 'Timeline Room'
            },
            {
                id : 884574541,
                url : 'https://picsum.photos/id/35/200/300',
                name : 'War Room'
            },
            {
                id : 9653214567,
                url : 'https://picsum.photos/id/39/200/300',
                name : 'Water Cooler-Talks'
            },
            {
                id : 55486464,
                url : 'https://picsum.photos/id/225/200/300',
                name : 'Friday Update'
            },
            {
                id : 77452144,
                url : 'https://picsum.photos/id/168/200/300',
                name : 'Monday Lags'
            },
        ]

        updateTeamsRoomsArray(RoomListArray)
    
    }, [])

    useEffect(() => {

        const getOnlineMembers = (teamid) => {
            // Populate OnlineMembersArray array here
        }

        let OnlineMembersArray = [
            {
                id : 9653214567,
                url : 'https://gravatar.com/avatar/2186b975d2d8ac084397b3fe1a42795d?s=400&d=robohash&r=x',
                name : 'Robin Pike',
                statusColor : 'green'
            },
            {
                id : 33651474,
                url : 'https://gravatar.com/avatar/1f1181db29ab95f4adf790463b8b6ef9?s=400&d=robohash&r=x',
                name : 'Jessica Abel',
                statusColor : 'green'
            },
            {
                id : 66352144,
                url : 'https://gravatar.com/avatar/fe78f037abc7274b60227211bcaddc2e?s=400&d=robohash&r=x',
                name : 'Harish Yadav',
                statusColor : 'green'
            },
            {
                id : 77415523,
                url : state.userProfileData.avatar,
                name : 'Sumit Lahiri',
                statusColor : 'green'
            }
        ]

        updateOnlineMembersArray(OnlineMembersArray)

    }, [actions, state.userProfileData.avatar])

 
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
                        <button className="text-white">
                            <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>add</i>
                        </button>
                    </div>
                    {
                        TeamRoomsArray.map((rooms) => 
                            <RoomListItem id={rooms.id} url={rooms.url} name={rooms.name} />
                        )
                    }
                </div>

                <div className="sidebar-icons" style={{height: "relative"}}>
                    <div className="flex justify-between items-center p-2 pl-3 hover:bg-gray-800">
                        <div className="text-white font-bold tracking-wide text-xs">Online Members : </div>
                    </div>
                    {
                        OnlineMembersArray.map((member) => 
                            <UserListItem id={member.id} url={member.url} name={member.name} statusColor={member.statusColor}/>
                    )
                }
                </div>
                
                <div className="absolute pin-b pb-4" style={{width: "calc(95% - 50px)"}}>
                    <div className="mt-4 px-3 w-full">
                        <button 
                            className="bg-purple-700 w-full rounded-full flex justify-center items-center hover:bg-purple-500 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={() => {
                                toggleModalItem()
                            }}>
                            <i class="material-icons md-light md-inactive mr-2">person_add</i>Invite Teammates
                        </button>
                    </div>
                </div>
                </div>
        </div>
    )
    
}
