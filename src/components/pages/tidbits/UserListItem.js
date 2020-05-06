
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
                        <div className="bg-white h-4 w-4 flex text-black text-2xl font-semibold rounded-lg overflow-hidden">
                            <img src={props.url} alt="T" />
                        </div>
                        <svg height="8" width="8">
                            <circle cx="4" cy="4" r="4" fill={props.statusColor} />
                                Sorry, your browser does not support inline SVG.  
                        </svg>
                        <div className="text-white px-1 font-bold tracking-wide text-xs">
                            {props.name}
                        </div>
                    </div>
                    <div className="flex justify-end">
                    <button className="text-gray-300 hover:text-indigo-500 px-1">
                            <i className="material-icons md-light md-inactive" style={{fontSize: "15px", margin: "0"}}>notes</i>
                        </button>
                        <button className="text-gray-300 hover:text-indigo-500 px-1" onClick={() => {
                            toggleShowModal(showModal => !showModal) }}>
                            <i className="material-icons md-light md-inactive" style={{fontSize: "15px", margin: "0"}}>question_answer</i>
                        </button>
                        <button className="text-gray-300 hover:text-indigo-500 px-1">
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
                                    <svg height="8" width="8">
                                        <circle cx="4" cy="4" r="5" fill={props.statusColor} />
                                            Sorry, your browser does not support inline SVG.  
                                    </svg>
                                    <div className="text-gray-600 px-1 font-bold tracking-wide text-xs">
                                        {props.name}
                                    </div>
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