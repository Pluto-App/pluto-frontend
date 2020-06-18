/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom";
import { css } from "@emotion/core";
import RingLoader from "react-spinners/RingLoader";
import googleLogo from "../../assets/google.svg";
import ToastNotification from '../widgets/ToastNotification';

// TODO Clear Login cache or store it in some local storage/file. 
// TODO Secure the Google Login. 

const LoginPage = () => {

  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
  `;

  let history = useHistory();

  const { state, actions } = useOvermind();

  const googleSignInAction = (e) => {
    e.preventDefault();
    actions.googlehandleLogin().then(() => {
      window.require("electron").ipcRenderer.send('resize-normal');
      state.userProfileData.addStatus ? history.push('/add-team') : history.push('/home')
      ToastNotification('success', "Login Success 😎")
    })
  }

  const openSignup = (e) => {
    e.preventDefault();
    window.require("electron").shell.openExternal('https://trumpetstechnologies.in/projects/pluto');
    state.signedIn = true
  }

  return (
    <div className="bg-gray-900 text-white flex flex-1 pt-20 px-10 justify-center" style={{ height: "calc(100vh - 30px)" }}>
      <div>
        <h2 className="text-center mb-6 font-italic font-bold text-xl">Pluto App</h2>
        {
          !state.loginStarted ?
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
            </button> :
            <RingLoader
              css={override}
              size={40}
              color={"red"}
              loading={state.loginStarted}
            />
        }
        <p className="text-center mt-6 text-md"> Don't have an account? <br />
          <a href="" onClick={openSignup} className="text-blue-500 font-bold no-underline hover:text-blue-300"> Sign Up </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;