import * as React from 'react'
import { useOvermind } from '../overmind'
import 'animate.css/animate.css'
import './App.css';

const App = () => {
  
  const { state, actions, effects, reaction } = useOvermind()

  return (
    <div className="App">
      <div style={{height: "30px", width:"100%", background:"#000" }}>
        <div className="flex justify-between items-center px-2 p-0">
          <button className="text-white cursor-pointer hover:bg-grey-darker"> 
            <i className="material-icons md-light md-inactive" style= {{ fontSize: "18px" }}> menu </i>
          </button>
        </div>
      </div>
        <p>
          <code>
            {state.title}, {state.name}
          </code>
        </p> 
    </div>
  );
}

export default App;
