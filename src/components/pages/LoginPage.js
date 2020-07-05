/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom";
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";
import googleLogo from "../../assets/google.svg";
import ToastNotification from '../widgets/ToastNotification';

// TODO Clear Login cache or store it in some local storage/file. 
// TODO Secure the Google Login. 

const LoginPage = () => {

  const override = css`
    display: block;
    margin: 0 auto;
    border-color: white;
  `;

  let history = useHistory();

  const { state, actions } = useOvermind();

  const googleSignInAction = (e) => {
    e.preventDefault();
    actions.googlehandleLogin().then(() => {
      window.require("electron").ipcRenderer.send('resize-normal');
      state.userProfileData.addStatus ? history.push('/add-team') : history.push('/home')
    })
  }

  const openSignup = (e) => {
    e.preventDefault();
    window.require("electron").shell.openExternal('https://trumpetstechnologies.in/projects/pluto');
    state.signedUp = true
  }

  return (
    <div className="bg-gray-900 text-white flex flex-1 pt-20 px-10 justify-center" style={{ height: "calc(100vh - 30px)" }}>
      <div>
        <h2 className="text-center mb-2 font-italic font-bold text-xl">Pluto Office</h2>
        {
          !state.loginStarted ?
            <button
              onClick={googleSignInAction}
              className="text-white bg-gray-800 border border-solid border-white-900 hover:bg-white shadow hover:shadow-lg inline-flex hover:text-black active:bg-white-600 font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline text-center rounded-full" 
              type="button" 
              style={{ transition: "all .50s ease" }}
            >
              <div className="flex">
                <img className="w-1/6" src={googleLogo} alt="" />
                <span className="w-5/6 py-1" >
                  Login With Google
              </span>
              </div>
            </button> :
            <div className="py-2 px-10 mt-2">
              <BeatLoader
                css={override}
                size={10}
                color={"white"}
                loading={state.loginStarted}
              />
            </div>
        }
        <p className="text-center mt-6 text-md"> Don't have an account? <br />
          <a href="" onClick={openSignup} className="text-blue-400 font-bold no-underline hover:text-blue-300"> Sign Up </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;