/* eslint-disable no-unused-vars */
import React from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"

const MainBar = React.memo((props) => {

    let history = useHistory();
    const { state, actions } = useOvermind();

    const handleHardReload = async () => {
        await actions.teamsbyuserid({
            userid: props.userid
        })
        if (state.activeTeamId !== 0) {
            await actions.roomsbyteamid({
                teamid: props.teamid
            })
            await actions.usersbyteamid({
                teamid: props.teamid
            })
        }
    }

    return (
        <div className="w-full flex">
            <div className="relative" style={{ height: "35px", width: "100%", background: "#000" }}>
                <div className="flex justify-between items-center px-2 p-0">
                    <p
                        className="flex p-1 items-center text-grey-dark font-bold rounded-lg hover:text-white cursor-pointer hover:bg-grey-darker">
                        {
                            state.userTeamDataInfo !== {} && state.activeTeamId !== 0 ? state.userTeamDataInfo[state.activeTeamId].teamname : props.appInfo
                        }
                    </p>
                    <div className="flex items-center">
                        <button className="text-white hover:bg-grey-darker rounded-lg p-1" onClick={(e) => {
                            history.push('/team-profile')
                        }}>
                            <i className="material-icons md-light md-inactive" style={{ fontSize: "15px", margin: "0" }}>settings</i>
                        </button>
                        <button className="text-white hover:bg-grey-darker rounded-lg p-1" onClick={() => {
                            window.localStorage.setItem("userData", JSON.stringify(state.userProfileData));
                            window.location.reload()
                        }}>
                            <i className="material-icons md-light md-inactive" style={{ fontSize: "15px", margin: "0" }}>autorenew</i>
                        </button>
                        <button className="text-white hover:bg-gray-900 py-1 focus:outline-none rounded-lg p-1"
                            onClick={(e) => {
                                handleHardReload()
                            }}
                        >
                            <i className="material-icons md-light md-inactive" style={{ fontSize: "16px", margin: "0" }}>autorenew</i>
                        </button>
                        <a href="/user-profile" onClick={(e) => {
                            e.preventDefault();
                            history.push('/user-profile')
                        }} className="flex items-center text-grey rounded-lg  px-1 py-1  no-underline cursor-pointer hover:bg-grey-darker">
                            <div className="bg-white h-6 w-6 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                <img src={state.userProfileData.avatar} alt="T" />
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default MainBar;