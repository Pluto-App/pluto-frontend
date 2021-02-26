/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react'
import { useOvermind } from '../../overmind'
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";
import googleLogo from "../../assets/google.svg";

import {AuthContext} from '../../context/AuthContext'

// TODO Clear Login cache or store it in some local storage/file. => window.localStorage in electron.
// TODO Secure the Google Login. 

const LoginPage = React.memo(() => {

  const override = css`
    display: block;
    margin: 0 auto;
    border-color: white;
  `;

  const { setAuthData } = useContext(AuthContext);
  const { state, actions } = useOvermind();

  const googleSignInAction = (e) => {
    e.preventDefault();

    actions.auth.googleLogin({setAuthData: setAuthData}).then(() => {
      // No action required as of now.
    })
  }

  return (
    <div className="bg-black text-white flex flex-1 pt-20 px-10 justify-center main-container w-full" 
      style={{ height: "calc(100vh - 30px)" }}
    >
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
        
      </div>
    </div>
  );
})

export default LoginPage;