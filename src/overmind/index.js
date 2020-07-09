import { createHook } from 'overmind-react'
import { state } from './state'
import * as actions from './actions'
import * as effects from './effects'
import * as store from './store'
import * as roomActions from './roomActions'

export const config = {
  state,
  actions,
  effects,
  store,
  roomActions
}

export const useOvermind = createHook()