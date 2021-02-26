// process.env['NODE_' + 'ENV'] = process.env.NODE_ENV

import { hot } from 'react-hot-loader/root';
import * as React from 'react'
import { render } from 'react-dom'
import { createOvermind } from 'overmind'
import { config } from './overmind'

import './styles/tailwind.css';
import './assets/fonts/css/icons.css'
import App from './App';

import {AppProviders} from './context'

const overmind = createOvermind(config)

hot(overmind)

render(
	<AppProviders>
		<App />
	</AppProviders>,
  	document.getElementById('root')
);
