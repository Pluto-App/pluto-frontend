/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { useOvermind } from '../../overmind';
import { useHistory } from "react-router-dom";
import { css } from "@emotion/core";
import HashLoader from "react-spinners/HashLoader";
import org_logo from "../../assets/logo.png";

export default function Sidebar(props) {

    let history = useHistory();

    const { state, actions } = useOvermind();

    const override = css`
        display: block;
        margin: 0 auto;
        border-color: purple;
    `;

    const addOrgNew = (e) => {
        e.preventDefault()
        history.push('/add-org');
    }

    return (
        <div className="w-15 bg-black text-white border-r border-blackblack fixed min-h-screen sidebar-container">
            <div className="sidebar-icons">
                <a className="sidebar-icon flex items-center text-grey  px-2 py-2 no-underline cursor-pointer hover:bg-gray-900"
                    style={{ transition: "all .60s ease" }}>
                    <div className="bg-white h-8 w-8 flex items-center justify-center text-purple-500 text-2xl font-semibold rounded-lg 
                    mb-1 overflow-hidden">
                        <img src={org_logo} />
                    </div>
                </a>
                {
                    !state.loadingCurrentTeam && state.userProfileData.teams ?
                        Object.entries(state.userProfileData.teams).map((team, index) =>
                            state.currentTeamId == team[1].id ?
                                <a href="/" className="sidebar-icon flex items-center text-grey px-2 py-2 no-underline cursor-pointer 
                                    bg-gray-900 hover:bg-indigo-900" style={{ transition: "all .60s ease" }} 
                                    id={team[1].id} key={team[1].id}

                                    onClick={(e) => {
                                        e.preventDefault()
                                        actions.team.updateCurrentTeam({team_id: team[1].id}).then(() => {
                                            history.push('/')
                                        })
                                    }}>
                                    <div className="bg-white h-8 w-8 flex items-center justify-center text-black text-2xl font-semibold 
                                    rounded-lg mb-1 overflow-hidden">
                                        <img src={team[1].avatar} alt='T' />
                                    </div>
                                </a> :
                                <a href="/" className="sidebar-icon flex items-center text-grey px-2 py-2 no-underline cursor-pointer 
                                hover:bg-gray-900" style={{ transition: "all .60s ease" }} id={team[1].id} key={team[1].id}
                                    onClick={async (e) => {
                                        e.preventDefault()
                                        actions.team.updateCurrentTeam({team_id: team[1].id}).then(() => {
                                            history.push('/')
                                        })
                                    }}>
                                    <div className="bg-white h-8 w-8 flex items-center justify-center text-black text-2xl font-semibold rounded-lg 
                                    mb-1 overflow-hidden">
                                        <img src={team[1].avatar} alt='T' />
                                    </div>
                                </a>
                        ) :
                        <HashLoader
                            css={override}
                            size={20}
                            color={"white"}
                            loading={state.loadingCurrentTeam}
                        />
                }
                
                {/* 
                <a href="/add-team" className="sidebar-icon flex items-center text-grey  px-2 py-2 no-underline 
                cursor-pointer hover:bg-gray-900" style={{ transition: "all .60s ease" }} onClick={addOrgNew}>
                    <div className="bg-white h-8 w-8 flex items-center justify-center text-black text-2xl font-semibold 
                    rounded-lg mb-1 overflow-hidden">
                        <i className="material-icons">add</i>
                    </div>
                </a>
                */}
            </div>
        </div>
    )
}
