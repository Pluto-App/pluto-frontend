
import React, { useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../../widgets/BackButton'
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";
import ToastNotification from '../../widgets/ToastNotification';

export default function TeamRegisterPage() {

    const [newTeamName, updateTeamName] = useState("");
    let history = useHistory();

    const override = css`
        display: block;
        margin: 0 auto;
        border-color: green;
    `;

    const { state, actions } = useOvermind();

    const createTeam = async (e) => {
        // FIXME preventDefault ?? 
        // FIXME Team Add press enter issue.
        e.preventDefault();
        if (newTeamName !== "" && newTeamName.length >= 4) {
            await actions.createTeam({
                userid: state.userProfileData.userid, // ownerid of team.
                teamname: newTeamName // new team name.
            })
            history.push('/home')
        }
        else {
            ToastNotification('error', "Must be 4 letters or more.")
        }
    }

    return (
        <div className="w-full flex">
            <div className="w-full bg-black ml-15 flex-1 text-white" style={{ height: "calc(100vh - 30px)" }}>
                <BackButton url={'/home'}></BackButton>
                <p className="font-bold px-4 text-white">Create New Team</p>
                <p className="text-gray-500 px-4">You will be set as Team Owner</p>
                <form className="px-4 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-600 text-sm font-bold mb-2" for="teamname">
                            Unique Team Name
                        </label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            onChange={(e) => {
                                if(e.target.value === "") {
                                    ToastNotification('error', "Team Name can't be empty")
                                } else {
                                    updateTeamName(e.target.value)
                                }
                            }}
                            onPaste={(e) => {
                                if(e.target.value === "" ) {
                                    ToastNotification('error', "Team Name can't be empty")
                                } else {
                                    updateTeamName(e.target.value)
                                }
                            }}
                            onKeyPress={(e) => {
                                if (e.keyCode === 13 || e.which === 13) {
                                    e.preventDefault()
                                    if(e.target.value === "" ) {
                                        ToastNotification('error', "Team Name can't be empty")
                                    } else {
                                        updateTeamName(e.target.value)
                                    }
                                }
                            }}
                            name="teamname"
                            id="teamname"
                            type="text"
                            placeholder="Team Name"
                            autoFocus />
                    </div>
                    {!state.addingTeam ?
                        <div className="flex items-center justify-between">
                            <button className="bg-indigo-500 w-full hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={createTeam}>
                                Create Team
                            </button>
                        </div> :
                        <BeatLoader
                            css={override}
                            size={10}
                            color={"white"}
                            loading={state.addingTeam}
                        />
                    }
                </form>
            </div>
        </div>
    )
}
