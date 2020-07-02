import React from 'react'
import { useHistory } from "react-router-dom"

export default function BackButton(props) {

    let history = useHistory();

    const back = (e) => {
        history.push(props.url);
    }

    return (
        <button
            onClick={back}
            className="text-white font-bold mb-3 tracking-wide flex items-center py-2 px-2 no-underline text-sm"
            type="button"
        >
            <i className="material-icons mr-1">keyboard_backspace</i>
            Back
        </button>
    )
}