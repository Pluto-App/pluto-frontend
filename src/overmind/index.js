import { createHook } from 'overmind-react'
import { state } from './state'
import * as actions from './actions'
import * as effects from './effects'
import * as store from './store'

export const config = {
  state,
  actions,
  effects,
  store
}

export const useOvermind = createHook()