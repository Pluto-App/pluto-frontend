import React, { useState } from 'react'
import {AuthContext} from './AuthContext'

import { hot } from 'react-hot-loader/root';
import { createOvermind } from 'overmind'
import { Provider } from 'overmind-react'
import { config } from '../overmind'

const overmind = createOvermind(config, {
  devtools: true 
  // defaults to 'localhost:3031'
})

const NewOverMind = hot(overmind);

let user = localStorage.getItem("currentUser")
  ? JSON.parse(localStorage.getItem("currentUser")).user
  : "";
  
let token = localStorage.getItem("currentUser")
  ? JSON.parse(localStorage.getItem("currentUser")).token
  : "";

const initialAuthState = {
  user: "" || user,
  token: "" || token
};

function AppProviders({children}) {
	const [authData, setAuthData] = useState(initialAuthState);
  
  	return (
 		 <Provider value={NewOverMind}>
        	<AuthContext.Provider value={{ authData, setAuthData }}>
        		{children}
    		</AuthContext.Provider>
    	</Provider>
  	)
}

export {AppProviders}
