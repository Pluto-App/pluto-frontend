
import React from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import BackButton from '../tidbits/BackButton'
import { css } from "@emotion/core";
import RingLoader from "react-spinners/RingLoader";

export default function TeamRegisterPage() {

    let history = useHistory();
    
    const override = css`
        display: block;
        margin: 0 auto;
        border-color: green;
    `;

    const { state, actions, effects, reaction } = useOvermind();

    const createTeam = async (e) => {
        e.preventDefault();
        // POST Request to create team. 
        await actions.createTeam({
            id : state.userProfileData.id, // Google ID of owner profile becomes part of team id.
            name : state.change["teamname"]
        })
        history.push('/home')
    }

    const handleChange = async (e) => {
        await actions.handleChangeMutations({
            target : e.target.name, 
            value : e.target.value
        })
    }

    return (
        <div className="w-full flex">
            <div className="w-full bg-gray-900 ml-15 flex-1 text-white" style={{height: "calc(100vh - 30px)"}}>
            <BackButton url={'/home'}></BackButton>
            <pre className="px-5 py-5">
                Create Team Page : 
            </pre>
                <form className="px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" for="username">
                            Unquie Team Name
                        </label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                onChange={handleChange}
                                name="teamname" 
                                id="teamname" 
                                type="text" 
                                placeholder="Team Name" />
                    </div>
                    { !state.addingTeam ? 
                        <div className="flex items-center justify-between">
                            <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={createTeam}>
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
