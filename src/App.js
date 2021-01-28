/* eslint-disable no-unused-vars */
import React, { useContext } from 'react'
import {AuthContext} from './context/AuthContext'

import AuthenticatedApp from './AuthenticatedApp'
import UnauthenticatedApp from './UnauthenticatedApp'

export default function App() {

  const { authData } = useContext(AuthContext);

  return authData.user ? <AuthenticatedApp /> : <UnauthenticatedApp />

}