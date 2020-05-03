
import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"

export default function RoomListItem(props) {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    const clickFunc = (e) => {

    }
    
    return (
    <div className="flex py-0 justify-between p-2 pl-3 hover:bg-gray-700" id={props.id} onClick={() => {
        clickFunc()
    }}>
        <div className="flex justify-start p-2 pl-3">
            <div className="bg-white h-5 w-5 flex text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                <img src={props.url} alt="T" />
            </div>
            <div className="text-white px-2 font-bold tracking-wide text-xs">
                {props.name} 
            </div>
        </div>
        <button className="text-white">
            <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>add</i>
        </button>
    </div>
    )
}