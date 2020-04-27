import * as React from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom";
import googleLogo from "../../assets/google.svg";
import { googleSignIn } from "../../auth/auth";
import { google_auth } from "../../firebase/AuthHandler";

const LoginPage = (props) => {

  let history = useHistory();

  const { state, actions, effects, reaction } = useOvermind();

  const login = (e) => {
    actions.handleLogin().then(() => {
      window.require("electron").ipcRenderer.send('resize-normal');
      history.push('/home');
    });
  }
 
  const googleSignInAction = (e) => {
    e.preventDefault();
    // TODO Handle Google Login here.
    // google_auth()
    // googleSignIn();
    history.push('/home');
  }

  const openSignup = (e) => {
    e.preventDefault();
    window.require("electron").shell.openExternal('https://trumpetstechnologies.in/projects/pluto');
  }

  return (
      <div className="bg-gray-900 text-white flex flex-1 pt-20 px-10 justify-center" style={{ height: "calc(100vh - 30px)" }}>
        <div>
          <h2 className="text-center mb-6 font-italic font-bold text-xl">Pluto App</h2>
          {/* <button
            onClick={login}
            className="w-full bg-purple-700 hover:bg-purple-500 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
            type="button"> Login
          </button> */}
          <button
            onClick={googleSignInAction}
            className="w-full bg-white hover:bg-gray-300 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline text-center rounded-full"
            type="button">
            <div className="flex">
              <img className="w-1/6" src={googleLogo} alt="" />
              <span className="w-5/6 text-black" >
                Google Sign-in
              </span>
            </div>
          </button>
          <p className="text-center mt-6 text-md"> Don't have an account? <br/> 
            <a href="" onClick={openSignup} className="text-blue-500 font-bold no-underline hover:text-blue-300"> Sign Up </a> 
          </p>
        </div>
      </div>
  );
}

export default LoginPage;