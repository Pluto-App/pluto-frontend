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
    const [TeamRoomsArray, updateTeamsRoomsArray] = useState([]);
    const [copySuccess, togglecopySuccess] = useState(false);
    const [showModal, toggleShowModal] = useState(false);

     useEffect(
         () => {
            const loadTeamsbyUserId = async (userid) => {
                await actions.teamsbyuserid({
                    userid : userid
                })
            }

            loadTeamsbyUserId(state.userProfileData.userid)    
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
                    name : 'Requirements 💁🏻'
                },
            ]

            updateTeamsRoomsArray(RoomListArray)
        }, [actions, state.userProfileData.userid]
    )

    useEffect(
        () => {
            if(state.activeTeamId !== 0) {
                const MembersData = async (teamid) => {
                    await actions.usersbyteamid({
                        teamid : teamid
                    })
                }
                MembersData(state.activeTeamId)
            }
        }, [actions, state.activeTeamId]
    )

    const customStyle = {
        "top": "46%",
        "width": "calc(94% - 50px)"
    }

    return (
        <div className="w-full flex">
            <Sidebar></Sidebar>
            <div className="w-full bg-gray-900 ml-15 flex-1 text-white" style={{height: "calc(100vh - 30px)", marginLeft: "49px"}}>
                <MainBar/>

                <div className="sidebar-icons" style={{height: "relative"}}>
                    <div className="flex justify-between items-center p-1 pl-1 hover:bg-gray-800">
                        <div className="text-gray-500 font-bold tracking-wide text-xs">Rooms</div>
                        <button className="text-white">
                            <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>add</i>
                        </button>
                    </div>
                    {
                        !state.loadingTeams ? 
                        TeamRoomsArray.map((rooms) => 
                            <RoomListItem id={rooms.id} url={rooms.url} name={rooms.name} />
                            ) : 
                            <BeatLoader
                                css={override}
                                size={15}
                                color={"white"}
                                loading={state.loadingTeams}
                            />
                    }
                </div>
                    <div className="flex justify-center items-center" style={{height: "15px"}}>
                        <div className="text-gray-500"></div>
                        <button className="text-white focus:outline-none">
                            <i className="material-icons hover:bg-gray-700" style={{fontSize: "18px", margin: "0"}}>keyboard_arrow_down</i>
                        </button>
                    </div>
                <div className="sidebar-icons" style={{height: "relative"}}>
                    <div className="flex justify-between items-center p-1 pl-1 hover:bg-gray-800">
                        <div className="text-gray-500 font-bold tracking-wide text-xs">Members</div>
                    </div>
                    {
                        !state.loadingMembers ? 
                            Object.entries(state.memberList).map(([key, member]) => 
                                <UserListItem data-record-id={key} id={member.userid} key={member.userid} url={member.avatar} name={member.username} email={member.useremail} statusColor={member.statusColor}/>
                            ) : 
                            <BeatLoader
                                css={override}
                                size={15}
                                color={"white"}
                                loading={state.loadingMembers}
                            />
                    }
                </div>
                    <div className="flex justify-center items-center" style={{height: "15px"}}>
                        <div className="text-gray-500"></div>
                        <button className="text-white focus:outline-none">
                            <i className="material-icons hover:bg-gray-700" style={{fontSize: "18px", margin: "0"}}>keyboard_arrow_down</i>
                        </button>
                    </div>
                <div className="absolute pin-b pb-4" style={{width: "calc(95% - 50px)"}}>
                    <div className="mt-4 px-3 w-full">
                        <button 
                            className="bg-purple-700 w-full rounded-full flex justify-center items-center hover:bg-purple-500 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={() => {
                                togglecopySuccess(false);
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
                    }}>
                      <h4 className="font-bold text-xl text-gray-600 text-center mb-2"> Invite Teammates to <br /> Pluto Office </h4>
                        <p className="text-purple-700 mb-3 text-center">
                            Share this link with others to grant access to this team.
                        </p>
                        <input 
                            id="InviteModalLink"
                            value={'https://pluto.abhishekwani.now.sh/join-team/' + state.teamDataInfo[state.activeTeamId].magiclink} 
                            className="w-full shadow appearance-none border text-purple-700 rounded py-1 px-1 bg-purple-200" />
                        <button
                            className="bg-purple-900 w-full rounded-sm flex justify-center text-white items-center hover:bg-purple-dark text-white font-bold py-2 px-2 mt-2 focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick = {(e) => {
                                var copyText = document.getElementById("InviteModalLink");
                                copyText.select();
                                copyText.setSelectionRange(0, 99999)
                                document.execCommand("copy");
                                togglecopySuccess(true);
                                setTimeout(() => toggleShowModal(showModal => !showModal), 1000);
                            }}
                        >{!copySuccess ? "Copy Invite" : "Copied !!"}</button>
                    </div> : 
                    <span>

                    </span>
                }
                </div>
        </div>
    )
    
}
