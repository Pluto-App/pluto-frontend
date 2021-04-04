/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useState, useEffect } from 'react'
import { useOvermind } from '../../overmind'
import googleLogo from "../../assets/google.svg";

import {AuthContext} from '../../context/AuthContext'

// TODO Clear Login cache or store it in some local storage/file. => window.localStorage in electron.
// TODO Secure the Google Login. 

const LoginPage = React.memo(() => {

  const { setAuthData } = useContext(AuthContext);
  const { state, actions } = useOvermind();

  const [ userEmail, setUserEmail ] = useState('');
  const [ loginCode, setLoginCode ] = useState('');
  const [ disableLoginCode, setDisableLoginCode ] = useState(true);
  const [ emailAdded, setEmailAdded ] = useState(false);
  const [ codeSent, setCodeSent ] = useState(false);
  const [ enableResend, setEnableResend ] = useState(false);

  const googleSignInAction = (e) => {
    e.preventDefault();

    actions.auth.googleLogin({setAuthData: setAuthData}).then(() => {
      // No action required as of now.
    })
  }

  const registerUser = () => {
    var userData = {user: {email: userEmail}};
    actions.user.registerUser({userData: userData}).then((responseData) => {
      if(responseData && responseData.id){
        setEmailAdded(true);
        setCodeSent(true);

        setTimeout(() => setEnableResend(true), 60000);
      }
    })
  }

  const resendLoginCode = () => {
    var userData = {email: userEmail};
    actions.user.resendLoginCode({userData: userData}).then((responseData) => {
      if(responseData && responseData.status == 'success'){
        setEnableResend(false);
        setTimeout(() => setEnableResend(true), 60000);
      }
    })
  }

  const login = () => {

    var userData = {
      email: userEmail,
      code: loginCode
    };

    actions.auth.loginViaCode({userData: userData, setAuthData: setAuthData}).then((responseData) => {
      // if(responseData && responseData.id){
      //   setEmailAdded(true);
      // }
    })
  }

  const resetEmail = () => {

    setUserEmail('');
    setEmailAdded(false);
    setCodeSent(false);
    setEnableResend(false);
  }

  useEffect(() => {

    let regEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (regEmail.test(userEmail)) {
      setDisableLoginCode(false);
    } else {
      setDisableLoginCode(true);
    }

  },[userEmail])

  return (
    <div className="bg-black text-white flex flex-1 pt-10 px-5 justify-center main-container w-full" 
      style={{ height: "calc(100vh - 30px)" }}
    >
      <div style={{width: '80%'}}>
        <h2 className="text-center mb-8 font-italic font-bold text-xl">Pluto Office</h2>
        {
          !state.loginStarted &&
          <div className="center">
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
            </button> 

            <p className="text-center mt-4 font-italic font-bold text-md">Or</p>

            {
              emailAdded &&
              <p className="mt-2 font-italic font-bold text-sm px-2" style={{textAlign: 'left'}}>
                <a href="#" className="underline" onClick={resetEmail}>
                  Change Email
                </a>
              </p>
            }

            {
              !emailAdded &&
              <div className="px-2">
                <input className="shadow appearance-none border rounded w-full mt-4 py-2 px-3 text-gray-700 leading-tight 
                  focus:outline-none focus:shadow-outline text-sm"
                  name="email"
                  id="email"
                  type="text"
                  placeholder="Email"
                  onChange={(e) => { setUserEmail(e.target.value) }}
                  autoFocus />
              </div>
            }

            {
              emailAdded &&
              <div className="px-2">
                <input className="shadow appearance-none border rounded w-full mt-4 py-2 px-3 text-gray-700 leading-tight 
                  focus:outline-none focus:shadow-outline text-sm"
                  name="code"
                  id="code"
                  type="text"
                  placeholder="Code"
                  onChange={(e) => { setLoginCode(e.target.value) }}
                  autoFocus />
              </div>
            }

            {
              emailAdded && enableResend &&
              <p className="mt-2 font-italic font-bold text-sm px-2" style={{textAlign: 'left'}}>
                <a href="#" className="underline" onClick={resendLoginCode}>
                  Resend Code to {userEmail}
                </a>
              </p>
            }

            {
              emailAdded && codeSent && !enableResend &&
              <p className="mt-2 font-italic font-bold text-sm px-2" style={{textAlign: 'left'}}>
                <a href="#" className="" >
                Code sent to {userEmail}
                </a>
              </p>
            }
            
            {
              !emailAdded &&
              <div className="px-2 pt-2">  
                <button
                  onClick={registerUser}
                  className="w-full center text-white bg-grey border border-solid hover:bg-white shadow hover:shadow-lg inline-flex 
                  hover:text-black active:bg-white-600 font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline text-center"
                  type="button"
                  style={{ transition: "all .60s ease" }}
                  disabled={disableLoginCode}
                >
                  <span style={{margin: 'auto'}}> Get Log In Code </span>
                </button> 
              </div>
            }
            
            {
              emailAdded &&
              <div className="px-2 pt-2">  
                <button
                  onClick={login}
                  className="w-full center text-white bg-grey border border-solid hover:bg-white shadow hover:shadow-lg inline-flex 
                  hover:text-black active:bg-white-600 font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline text-center"
                  type="button"
                  style={{ transition: "all .60s ease" }}
                >
                  <span style={{margin: 'auto'}}> Log In </span>
                </button> 
              </div>  
            }
            
            {
              /*
                <p className="text-center mt-8 font-italic font-bold text-sm">
                  Don't have an account yet? <a href="#" className="underline">Sign up!</a>
                </p>  
              */
            }
            
          </div>
        }
        
      </div>
    </div>
  );
})

export default LoginPage;