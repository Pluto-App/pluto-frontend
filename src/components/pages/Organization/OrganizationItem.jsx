/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from 'react'
import { useOvermind } from '../../../overmind'
import { useHistory } from "react-router-dom"
import * as Cookies from "js-cookie";
import ToastNotification from '../../widgets/ToastNotification';
import { socket_live, events } from '../../sockets';
import * as md5 from "md5";