import * as React from 'react'
import { useOvermind } from '../overmind'

const LoginPage = (props) => {
  
  const { state, actions, effects, reaction } = useOvermind()

  return (
    <div className="loginPage">
      <div className="bg-black text-white flex flex-1 pt-20 px-10 justify-center" style={{ height: "calc(100vh - 30px)" }}>
        <div>
          <h2 className="text-center mb-6 font-italic">Pluto App</h2>
          {
            !state.loggedIn ? 
            <button
              onClick={() => {actions.handleLogin()}}
              className="w-full bg-purple-700 hover:bg-blue-500 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
              type="button"> Login
            </button> : 
            <button
              onClick={() => {actions.handleLogout()}}
              className="w-full bg-red-700 hover:bg-red-500 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
              type="button"> Logout
            </button> 
          }
          {
            state.signedIn ? <p className="text-center text-green-500 mt-6 text-md font-bold hover:text-green-300"> {state.signUptxt} <br/></p> : 
            <p className="text-center mt-6 text-md"> Don't have an account? <br/> 
              <a href="#" onClick={() => {actions.handleSignup()}} className="text-blue-500 font-bold no-underline hover:text-blue-300"> Sign Up </a> 
            </p>
          }
        </div>
      </div>
    </div>
  );
}

export default LoginPage;