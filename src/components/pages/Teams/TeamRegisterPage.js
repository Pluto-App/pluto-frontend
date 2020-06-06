
import React from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../../widgets/BackButton'
import { css } from "@emotion/core";
import RingLoader from "react-spinners/RingLoader";
import ToastNotification from '../../widgets/ToastNotification';

export default function TeamRegisterPage() {

    let history = useHistory();

    const override = css`
        display: block;
        margin: 0 auto;
        border-color: green;
    `;

    const { state, actions } = useOvermind();

    const createTeam = async (e) => {
        e.preventDefault();
        await actions.createTeam({
            userid: state.userProfileData.userid,
            teamname: state.change["teamname"]
        })
        history.push('/home')
    }

    const handleChange = async (e) => {
        await actions.handleChangeMutations({
            target: e.target.name,
            value: e.target.value
        })
    }

    return (
        <div className="w-full flex">
            <div className="w-full bg-black ml-15 flex-1 text-white" style={{ height: "calc(100vh - 30px)" }}>
                <BackButton url={'/home'}></BackButton>
                <p className="font-bold px-4 text-white">Create New Team</p>
                <p className="text-gray-700 px-4">You will be set as Team Owner</p>
                <form className="px-4 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" for="username">
                            Unquie Team Name
                        </label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            onChange={(e) => {
                                if (e.target.value === "") {
                                    ToastNotification('error', "Team Name can't be empty")
                                } else handleChange(e)
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
                        <RingLoader
                            css={override}
                            size={50}
                            color={"green"}
                            loading={state.addingTeam}
                        />
                    }
                </form>
            </div>
        </div>
    )
}
