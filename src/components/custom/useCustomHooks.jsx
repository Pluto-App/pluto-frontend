// Custom Hooks
import React from 'react'
import { useReducer } from 'react'

const handleDispatchReducer = (state, action) => {
    switch(action.type) {
        case "eventTrigger" :
            // trigger some action.


        default : 
            return state;
    }
}

const useCustomHook = React.memo((props) => {

    const [dataElem, dispatch] = useReducer(handleDispatchReducer, props);

    return (
        // dispatch({
        //     type : "eventTrigger",
        //     dataElem
        // });
        <>
            
        </>
    )
})