import React from 'react'
import { useHistory } from "react-router-dom"

export default function BackButton(props) {

    let history = useHistory();

    const back = (e) => {
        e.preventDefault()
        history.push(props.url);
    }

    return (
            <button
                    onClick={back}
                    className="text-white font-bold py-2 px-4 mt-2"
                    type="button"
                > 
                <i className="material-icons md-light md-inactive">keyboard_backspace</i>
            </button> 
    )
}