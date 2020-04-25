import * as React from 'react'
import { useOvermind } from '../overmind'

const App = () => {
  
  const { state, actions, effects, reaction } = useOvermind()

  return (
    <div className="App">
      <div style={{height: "30px", width:"100%", background:"#000" }}>
        <div className="flex justify-between items-center px-2 p-0">
        <button className="text-white cursor-pointer hover:bg-grey-darker">
          <i className="material-icons md-light md-inactive" style={{ fontSize: "16px" }}> menu </i>
        </button>
        <div class="flex-1" style={{ height: "30px" }}>
        </div>
        <div className="flex items-center">
          <button className="text-white hover:bg-grey-darker" style= {{ marginRight: "15px" }}> 
            <i className="material-icons md-light md-inactive" style={{ fontSize: "16px", margin: "0", marginTop: "-15px" }}> minimize </i></button>
          <button className="text-white hover:bg-grey-darker" >
            <i className="material-icons md-light md-inactive" style={{ fontSize: "16px", margin: "0" }}> close </i>
          </button>
        </div>
        </div>
      </div>
      {/* Login Div starts here, Move to different section later. */}
      <div className="bg-black text-white flex flex-1 pt-20 px-10 justify-center" style={{ height: "calc(100vh - 30px)" }}>
        <div>
        <h2 className="text-center mb-6 font-italic">Pluto App</h2>
        </div>
      </div>
    </div>
  );
}

export default App;
