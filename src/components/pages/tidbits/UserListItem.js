
import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"

export default function UserListItem(props) {

    let history = useHistory();

    const { state, actions, effects, reaction } = useOvermind();

    const [showModal, toggleShowModal] = useState(false);

    const customStyle = {
        "top": "37%",
        "width": "calc(100%)"
    }

    const clickFunc = (e) => {

    }
    
    return (
                <div className="flex py-0 justify-between p-1 pl-1 hover:bg-gray-800" id={props.id} onClick={(e) => {
                    clickFunc()
                }}>
                    <div className="flex justify-start p-2 pl-1">
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
                    <div className="flex justify-end">
                        <button className="text-indigo-400 hover:text-indigo-900 px-1">
                            <i className="material-icons md-light md-inactive" style={{fontSize: "15px", margin: "0"}}>description</i>
                        </button>
                        <button className="text-white hover:text-green-400 px-1" onClick={() => {
                            toggleShowModal(showModal => !showModal) }}>
                            <i className="material-icons md-light md-inactive" style={{fontSize: "15px", margin: "0"}}>chat</i>
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-300 px-1">
                            <i className="material-icons md-light md-inactive" style={{fontSize: "18px", margin: "0"}}>video_call</i>
                        </button>
                        {
                            showModal ? 
                            <div className="items-center absolute rounded-lg bg-white mx-1 p-1 py-1" style={customStyle}>
                                <h4 className="font-bold text-xl text-gray-600 text-center mb-1"> Messenger </h4>
                                <div className="flex justify-start p-2 pl-1">
                                    <div className="bg-white h-4 w-4 flex text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                                        <img src={props.url} alt="T" />
                                    </div>
                                    <div className="text-gray-500 px-2 font-bold tracking-wide text-xs">
                                        {props.name}
                                    </div>
                                    <svg height="10" width="10">
                                            <circle cx="5" cy="5" r="4" fill={props.statusColor} />
                                    </svg>
                                </div>
                                <input 
                                    placeholder='Send Message'
                                    className="w-full shadow appearance-none border rounded py-1 text-gray-900 bg-purple-200"
                                />
                            </div> : <a></a>
                        }
                    </div>
                </div>
    )
}