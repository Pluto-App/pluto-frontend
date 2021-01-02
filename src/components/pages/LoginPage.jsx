/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react'
import { useOvermind } from '../../overmind'
import { useHistory } from "react-router-dom";
import Image from 'react-image-resizer';
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";
import googleLogo from "../../assets/google.svg";
import main from "../../assets/main.png";

import {AuthContext} from '../../context/AuthContext'

// TODO Clear Login cache or store it in some local storage/file. => window.localStorage in electron.
// TODO Secure the Google Login. 

const LoginPage = React.memo(() => {

  const override = css`
    display: block;
    margin: 0 auto;
    border-color: white;
  `;

  let history = useHistory();

  const { authData, setAuthData } = useContext(AuthContext);
  const { state, actions } = useOvermind();

  const googleSignInAction = (e) => {
    e.preventDefault();

    actions.auth.googleLogin({setAuthData: setAuthData}).then(() => {
      window.require("electron").ipcRenderer.send('resize-normal');
      //state.userProfileData.addStatus ? history.push('/add-team') : history.push('/home')
    })
  }

  const openSignup = (e) => {
    e.preventDefault();
    window.require("electron").shell.openExternal('https://joinpluto.netlify.app/');
  }

  return (
    <div className="bg-black text-white flex flex-1 pt-20 px-10 justify-center" style={{ height: "calc(100vh - 30px)" }}>
      {/* <div className="text-center mb-3 font-italic font-bold text-xl">
        <Image
          img src={main} alt="Logo" className="text-center mb-3 font-italic font-bold text-xl"
          height={30}
          width={30}
        />
      </div> */}
      <div>
        <h2 className="text-center mb-3 font-italic font-bold text-xl">Pluto Office</h2>
        {
          !state.loginStarted ?
            <button
              onClick={googleSignInAction}
              className="text-white bg-indigo-900 border border-solid border-indigo-900 hover:bg-white shadow hover:shadow-lg inline-flex 
              hover:text-black active:bg-white-600 font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline text-center rounded-full"
              type="button"
              style={{ transition: "all .60s ease" }}
            >
              <div className="flex">
                <img className="w-1/6" src={googleLogo} alt="" />
                <span className="w-5/6 py-1 px-1" >
                  Google Login
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
          <a href="" onClick={openSignup} className="text-indigo-700 font-bold no-underline hover:text-indigo-400"
            style={{ transition: "all .60s ease" }}>Sign Up</a>
        </p>
      </div>
    </div>
  );
})

export default LoginPage;