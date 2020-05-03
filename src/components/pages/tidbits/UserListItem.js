
import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"

export default function UserListItem(props) {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    const clickFunc = (e) => {

    }
    
    return (
                <div className="flex py-0 justify-between p-2 pl-3 hover:bg-gray-800" id={props.id} onClick={(e) => {
                    clickFunc()
                }}>
                    <div className="flex justify-start p-2 pl-3">
                        <div className="bg-white h-4 w-4 flex text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                            <img src={props.url} alt="T" />
                        </div>
                        <div className="text-white px-2 font-bold tracking-wide text-xs">
                            {props.name}
                        </div>
                        <svg height="10" width="10">
                                <circle cx="5" cy="5" r="4" fill={props.statusColor} />
                        </svg>
                    </div>
                    <button className="text-white">
                        <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>add</i>
                    </button>
                </div>
    )
}