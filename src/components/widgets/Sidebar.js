/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom"
import { css } from "@emotion/core";
import HashLoader from "react-spinners/HashLoader";
import org_logo from "../../assets/logo.png"

export default function Sidebar(props) {

    let history = useHistory();

    const { state, actions } = useOvermind();

    const override = css`
        display: block;
        margin: 0 auto;
        border-color: purple;
    `;

    const addTeam = (e) => {
        e.preventDefault()
        history.push('/add-team');
    }

    return (
        <div className="w-15 bg-gray-900 text-white border-r border-blackblack fixed min-h-screen ">
            <div className="sidebar-icons">
                <a className="sidebar-icon flex items-center text-grey  px-2 py-2 no-underline cursor-pointer hover:bg-gray-800" onClick="">
                    <div className="bg-white h-8 w-8 flex items-center justify-center text-purple-500 text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                        <img src={org_logo} />
                    </div>
                </a>
                {
                    !state.loadingTeams ?
                        state.userTeamDataInfo !== {} &&
                        Object.entries(state.userTeamDataInfo).map(([id, value]) =>
                            state.userTeamDataInfo[id].isActive ?
                                <a href="/home" className="sidebar-icon flex items-center text-grey px-2 py-2 no-underline cursor-pointer bg-purple-700 hover:bg-gray-800" id={id} key={id}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        actions.changeActiveTeam(id).then(() => {
                                            history.push('/home')
                                        })
                                    }}>
                                    <div className="bg-white h-8 w-8 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                        <img src={state.userTeamDataInfo[id].avatar} alt="T" />
                                    </div>
                                </a> :
                                <a href="/home" className="sidebar-icon flex items-center text-grey px-2 py-2 no-underline cursor-pointer hover:bg-gray-800" id={id} key={id}
                                    onClick={async (e) => {
                                        e.preventDefault()
                                        actions.changeActiveTeam(id).then(() => {
                                            history.push('/home')
                                        })
                                    }}>
                                    <div className="bg-white h-8 w-8 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                        <img src={state.userTeamDataInfo[id].avatar} alt="T" />
                                    </div>
                                </a>
                        ) :
                        <HashLoader
                            css={override}
                            size={20}
                            color={"white"}
                            loading={state.loadingTeams}
                        />
                }
                <a href="/add-team" className="sidebar-icon flex items-center text-grey  px-2 py-2 no-underline cursor-pointer hover:bg-gray-800" onClick={addTeam}>
                    <div className="bg-white h-8 w-8 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                        <i className="material-icons">add</i>
                    </div>
                </a>
            </div>
        </div>
    )
}
