import { hot } from 'react-hot-loader/root';
import * as React from 'react'
import { render } from 'react-dom'
import { createOvermind } from 'overmind'
import { Provider } from 'overmind-react'
import { config } from './overmind'

import './styles/tailwind.css';
import './assets/fonts/css/icons.css'
import App from './components/App';

// const polyfill = (() => {
//   if (!Object.entries)
//   Object.entries = function( obj ){
//     var ownProps = Object.keys( obj ),
//         i = ownProps.length,
//         resArray = new Array(i);
//     while (i--)
//       resArray[i] = [ownProps[i], obj[ownProps[i]]];
    
//     return resArray;
//   }
// })();

const overmind = createOvermind(config, {
  devtools: true // defaults to 'localhost:3031'
})

const NewOverMind = hot(overmind)
const NewApp = hot(App)

render(
  <Provider value={NewOverMind}>
    <NewApp />
  </Provider>,
  document.getElementById('root')
);
