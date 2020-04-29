import * as React from 'react'
import { render } from 'react-dom'
import { createOvermind } from 'overmind'
import { Provider } from 'overmind-react'
import { config } from './overmind'

import './styles/tailwind.css';
import './assets/fonts/css/icons.css'
import App from './components/App';

const overmind = createOvermind(config)

if (module.hot) {
  if (module.hot.data && module.hot.data.state) {
    overmind.rehydrate(module.hot.data.state);
  }
  module.hot.dispose(data => {
    data.state = overmind.state
  });
}

render(
  <Provider value={overmind}>
    <App />
  </Provider> , 
  document.getElementById('root')
);
