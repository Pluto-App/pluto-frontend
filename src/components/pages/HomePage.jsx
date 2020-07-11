/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react'
import Sidebar from '../widgets/Sidebar'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"
import MainBar from "../widgets/MainBar"
import UserListItem from "./Users/UserListItem"
import RoomListItem from "./Rooms/RoomListItem"
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";
import ToastNotification from '../widgets/ToastNotification'
import { sha224 } from 'js-sha256';

// TODO Move Active Win info to user profile (not necessary?)
// FIXME Add Active Win Support. The package fails to build. Search Alternatives. 

function RoomList(props) {

    const roomlist = props.map((rooms) =>
        <RoomListItem
            id={rooms.id}
            key={rooms.id.toString()}
            name={rooms.roomname}
        />
    )

    return (
        <>
            {roomlist}
        </>
    );
}

function MembersList(props) {

    const teamMemberList = Object.entries(props).map(([id, member]) =>
        <UserListItem
            id={member.userid}
            key={member.userid.toString()}
            url={member.avatar}
            name={member.username}
            email={member.useremail}
            statusColor={member.statusColor}
        />
    )

    return (
        <>
            {teamMemberList}
        </>
    );
}

export default function HomePage() {

    let history = useHistory();

    const override = css`
        display: block;
        margin: 0 auto;
        border-color: white;
    `;

    const { state, actions } = useOvermind();
    const [copySuccess, togglecopySuccess] = useState(false);
    const [showInviteModal, toggleshowInviteModal] = useState(false);
    const [isAddingRoom, setIsAddingRoom] = useState(false);
    const [appInfo, updateAppInfo] = useState("No Teams");
    const [newRoomName, updateNewRoomName] = useState("");

    const addingNewRoom = async (roomname) => {

        let newRoom = {
            roomid: sha224(state.activeTeamId + roomname),
            teamid: state.activeTeamId,
            roomname: roomname + " 🛰️" 
        }
        actions.addNewRoom(newRoom)
    }

    const handleChange = async (e) => {
        updateNewRoomName(e.target.value);
    }

    const load1 = async () => {
        await actions.teamsbyuserid({
            userid: state.userProfileData.userid
        })
    }

    const load2 = async () => {
        if (state.activeTeamId !== 0) {
            await actions.roomsbyteamid({
                teamid: state.activeTeamId
            })
            await actions.usersbyteamid({
                teamid: state.activeTeamId
            })
        }
    }

    useEffect(
        () => {
            load1();
        }, [actions, state.userProfileData.userid]
    )

    useEffect(
        () => {
            load2();
        }, [actions, state.activeTeamId]
    )

    /**
     * Active Win Code. 
     */
    // useEffect(
    //     () => {

    //         let interval = 0;
    //         if (interval) {
    //             clearInterval(interval);
    //         }

    //         // Every 5 Secs, make a query. 
    //         interval = setInterval(() => {
    //             activeWin().then((data) => {
    //                 if (data !== null && data.owner !== null) {
    //                     updateAppInfo(appInfo => {
    //                         appInfo = data.owner.name;
    //                     });
    //                 }
    //             })
    //         }, 5000)

    //         // Clear interval on return . 
    //         return () => {
    //             clearInterval(interval);
    //         }
    //         // eslint-disable-next-line react-hooks/exhaustive-deps
    //     }, []
    // )

    const customStyle = {
        "top": "46%",
        "width": "calc(94% - 50px)"
    }
    return (
        <div className="w-full flex">
            <Sidebar></Sidebar>
            <div className="w-full bg-gray-900 ml-15 flex-1 text-white" style={{ height: "calc(100vh - 30px)", marginLeft: "49px" }}>
                <MainBar
                    userid={state.userProfileData.userid}
                    teamid={state.activeTeamId}
                    appName={appInfo}
                />
                <div className="sidebar-icons" style={{ height: "relative" }}>
                    <div className="flex justify-between items-center p-1 pl-1 hover:bg-gray-800">
                        <div className="text-gray-500 px-3 font-bold tracking-wide text-xs">Rooms</div>
                        <button className="text-white focus:outline-none hover:bg-gray-800">
                            <i className="material-icons md-light md-inactive" onClick={(e) => {
                                e.preventDefault();
                                setIsAddingRoom(isAddingRoom => !isAddingRoom)
                            }} style={{ fontSize: "18px", margin: "0" }}>add</i>
                        </button>
                    </div>
                    {
                        isAddingRoom &&
                        <div className="flex justify-center items-center hover:bg-gray-800">
                            <input className="shadow appearance-none border rounded w-full py-1 
                            px-5 text-gray-700 leading-tight focus:outline-none"
                                style={{ width: "95%" }}
                                onChange={handleChange}
                                onKeyPress={(e) => {
                                    if (e.keyCode === 13 || e.which === 13) {
                                        if (e.target.value === "") {
                                            ToastNotification('error', "Room name can't be empty")
                                        } else {
                                            setIsAddingRoom(false)
                                            addingNewRoom(e.target.value)
                                        }
                                    }
                                }}
                                name="roomname"
                                id="roomname"
                                type="text"
                                placeholder="Add New Room"
                                autoFocus />
                        </div>
                    }
                    <div className="" style={{ height: "115px", overflowY: "scroll" }}>
                        {
                            !state.loadingRooms ?
                                RoomList(state.RoomListArray) :
                                <BeatLoader
                                    css={override}
                                    size={10}
                                    color={"white"}
                                    loading={state.loadingRooms}
                                />
                        }
                    </div>
                    <div className="flex justify-center items-center" style={{ height: "15px" }}>
                        <div className="text-gray-500"></div>
                        <button className="text-white focus:outline-none">
                            <i className="material-icons hover:bg-gray-700" style={{ fontSize: "18px", margin: "0" }}>keyboard_arrow_down</i>
                        </button>
                    </div>
                </div>

                <div className="sidebar-icons" style={{ height: "relative" }}>
                    <div className="flex justify-between items-center p-2 pl-2 hover:bg-gray-800">
                        <div className="text-gray-500 px-3 font-bold tracking-wide text-xs">Team Mates</div>
                    </div>
                    {
                        !state.loadingMembers ?
                            MembersList(state.userMapping) :
                            <BeatLoader
                                css={override}
                                size={10}
                                color={"white"}
                                loading={state.loadingMembers}
                            />
                    }
                </div>
                <div className="flex justify-center items-center" style={{ height: "15px" }}>
                    <div className="text-gray-500"></div>
                    <button className="text-white focus:outline-none">
                        <i className="material-icons hover:bg-gray-700" style={{ fontSize: "18px", margin: "0" }}>keyboard_arrow_down</i>
                    </button>
                </div>
                <div className="absolute pin-b pb-4" style={{ width: "calc(95% - 50px)" }}>
                    <div className="mt-4 px-3 w-full">
                        <button
                            className="bg-purple-700 w-full rounded-full flex justify-center items-center hover:bg-purple-500 
                            text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={() => {
                                togglecopySuccess(false);
                                toggleshowInviteModal(showInviteModal => !showInviteModal)
                            }}>
                            <i class="material-icons md-light md-inactive mr-2">person_add</i>Invite Teammates
                        </button>
                    </div>
                </div>
                {
                    // Invite Modal HTML
                    showInviteModal && state.activeTeamId !== 0 ?
                        <div className="items-center absolute rounded-sm bg-white mx-2 p-1 py-1" style={customStyle}
                            onClick={(e) => {
                            }}>
                            <h4 className="font-bold text-xl text-gray-600 text-center mb-2"> Invite Teammates to <br /> Pluto Office </h4>
                            <p className="text-purple-700 mb-3 text-center">
                                Share this link with others to grant access to this team.
                        </p>
                            <input
                                id="InviteModalLink"
                                value={'https://joinpluto.herokuapp.com/#/j/' + state.userTeamDataInfo[state.activeTeamId].magiclink}
                                className="w-full shadow appearance-none border text-purple-700 rounded py-1 px-1 bg-purple-200" />
                            <button
                                className="bg-purple-900 w-full rounded-sm flex justify-center text-white items-center hover:bg-purple-dark 
                                text-white font-bold py-2 px-2 mt-2 focus:outline-none focus:shadow-outline"
                                type="button"
                                onClick={(e) => {
                                    var copyText = document.getElementById("InviteModalLink");
                                    copyText.select();
                                    copyText.setSelectionRange(0, 99999)
                                    document.execCommand("copy");
                                    togglecopySuccess(true);
                                    setTimeout(() => toggleshowInviteModal(showInviteModal => !showInviteModal), 1000);
                                }}
                            >{!copySuccess ? "Copy Invite" : "Copied !!"}</button>
                        </div> :
                        <></>
                }
            </div>
        </div>
    )

}