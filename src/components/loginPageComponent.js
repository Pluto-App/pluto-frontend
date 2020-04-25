import * as React from 'react'
import { useOvermind } from '../overmind'

const LoginPage = (props) => {
  
  const { state, actions, effects, reaction } = useOvermind()

  return (
      <div className="bg-black text-white flex flex-1 pt-20 px-10 justify-center" style={{ height: "calc(100vh - 30px)" }}>
        <div>
          <h2 className="text-center mb-6 font-italic">Pluto App</h2>
          <button
            className="w-full bg-purple-700 hover:bg-blue-500 text-white font-bold py-2 px-4 mt-2 focus:outline-none focus:shadow-outline"
            type="button"> Login
          </button>
          <p className="text-center mt-6 text-md"> Don't have an account? <br/> 
            <a href="" className="text-blue-500 font-bold no-underline hover:text-blue-300"> Sign Up </a> 
          </p>
        </div>
      </div>
  );
}

export default LoginPage;