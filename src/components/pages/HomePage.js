import React, { useEffect, useState } from 'react'
import Sidebar from '../widgets/Sidebar'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"
import MainBar from "../widgets/MainBar"
import UserListItem from "./tidbits/UserListItem"
import RoomListItem from "./tidbits/RoomListItem"
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";

export default function HomePage() {

    let history = useHistory();

    const override = css`
        display: block;
        margin: 0 auto;
        border-color: white;
    `;


    const { state, actions, effects, reaction } = useOvermind();

    const [OnlineMembersArray, updateOnlineMembersArray] = useState([]);
    const [TeamRoomsArray, updateTeamsRoomsArray] = useState([]);
    const [showModal, toggleShowModal] = useState(false);

    const openInviteLink = (e) => {
        e.preventDefault();
        toggleShowModal(showModal => !showModal)
        window.require("electron").shell.openExternal('https://pluto.abhishekwani.now.sh/join-team/' + state.teamDataInfo[state.activeTeamId].magiclink);
    }

    useEffect(() => {
        
        const getTeamRooms = (teamid) => {
            // Populate TeamRoomsArray array here from Team Id
        }
        
        let RoomListArray = [
            {
                id : 55486464,
                url : 'https://media.timeout.com/images/101609205/750/422/image.jpg',
                name : 'Coffee Room ☕'
            },
            {
                id : 884574541,
                url : 'https://img.icons8.com/dusk/64/000000/timeline.png',
                name : 'Progess Updates 🏁'
            },
            {
                id : 9653214567,
                url : 'https://image.shutterstock.com/image-photo/kanban-board-one-prerequisites-agile-260nw-1203911209.jpg',
                name : 'Daily Standup 🚀'
            },
            {
                id : 55486464,
                url : 'https://zioconnects.com/wp-content/uploads/2017/06/Ravago-Conference-Room-A1-1200x800.jpg',
                name : 'Conference Room ⚙️'
            },
            {
                id : 77452144,
                url : 'https://vignette.wikia.nocookie.net/harrypotter/images/c/cf/HPDH2-0996.jpg/revision/latest?cb=20140828115840',
                name : 'Room of Requirement 💁🏻'
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
                url : 'https://img.icons8.com/metro/26/000000/command-line.png',
                name : 'Stanley Wu',
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
        "top": "52%",
        "width": "calc(94% - 50px)"
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
                        !state.loadingHome ? 
                        TeamRoomsArray.map((rooms) => 
                            <RoomListItem id={rooms.id} url={rooms.url} name={rooms.name} />
                            ) : 
                            <BeatLoader
                                css={override}
                                size={15}
                                color={"white"}
                                loading={state.loadingHome}
                            />
                    }
                </div>

                <div className="sidebar-icons" style={{height: "relative"}}>
                    <div className="flex justify-between items-center p-2 pl-3 hover:bg-gray-800">
                        <div className="text-white font-bold tracking-wide text-xs">Online Members : </div>
                    </div>
                    {
                        !state.loadingHome ? 
                        OnlineMembersArray.map((member) => 
                            <UserListItem id={member.id} url={member.url} name={member.name} statusColor={member.statusColor}/>
                        ) : 
                        <BeatLoader
                            css={override}
                            size={15}
                            color={"white"}
                            loading={state.loadingHome}
                        />
                }
                </div>
                
                <div className="absolute pin-b pb-4" style={{width: "calc(95% - 50px)"}}>
                    <div className="mt-4 px-3 w-full">
                        <button 
                            className="bg-purple-700 w-full rounded-full flex justify-center items-center hover:bg-purple-500 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={() => {
                                toggleShowModal(showModal => !showModal)
                            }}>
                            <i class="material-icons md-light md-inactive mr-2">person_add</i>Invite Teammates
                        </button>
                    </div>
                </div>
                {
                    showModal ? 
                    <div className="items-center absolute rounded-sm bg-white mx-2 p-1 py-1" style={customStyle}
                    onClick={(e) => {
                        openInviteLink(e)
                    }}>
                      <h4 className="font-bold text-xl text-gray-600 text-center mb-2"> Invite Teammates to <br /> Pluto Office </h4>
                        <p className="text-purple-700 mb-3 text-center">
                            Share this link with others to grant access to this team.
                        </p>
                        <input 
                            value={'https://pluto.abhishekwani.now.sh/join-team/' + state.teamDataInfo[state.activeTeamId].magiclink} 
                            className="w-full shadow appearance-none border rounded py-1 px-1 text-gray-900 bg-purple-200" />
                    </div> : 
                    <span>

                    </span>
                }
                </div>
        </div>
    )
    
}
