import * as axios from 'axios'
import qs from 'qs'
import ToastNotification from '../components/widgets/ToastNotification'
import { v4 as uuidv4 } from 'uuid';

const customHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'cache-control': 'no-cache'
};

export const randomStringGen = () => {
    let result = ""
    let randomString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
    for (var i = 0; i < randomString.length; i += 1) {
        result += randomString.charAt(Math.floor(Math.random() * randomString.length));
    }
    return result
}

export const getAccessToken = async () => {

    let accessString = randomStringGen()

    let token = await axios.post(process.env.REACT_APP_FETCH_URL, qs.stringify({
        accessId: accessString
    }), customHeaders)

    return token.data.accessToken;
}

export const postHandler = async (url, payload) => {

    var data;
    let gettoken = await getAccessToken()
    payload.requestId = uuidv4()

    try {
        let dump = await axios.post(url, qs.stringify(
            payload
        ), {
            referrerPolicy: 'no-referrer',
            redirect: 'follow', 
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'cache-control': 'no-cache',
                'authorization': `Bearer ${gettoken}`
            },
        })
        data = await dump.data
    } catch (error) {
        ToastNotification('error', error)
    }

    return data
}


export const getHandler = async (url, payload) => {

    var data;
    let gettoken = await getAccessToken()
    payload.requestId = uuidv4()

    try {
        let dump = await axios.get(url, qs.stringify(
            payload
        ), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'cache-control': 'no-cache',
                'authorization': `Bearer ${gettoken}`
            },
        })
        data = await dump.data
    } catch (error) {
        ToastNotification('error', error)
    }

    return data
}

export const updateHandler = async (url, payload) => {

    var data;
    let gettoken = await getAccessToken()
    payload.requestId = uuidv4()

    try {
        let dump = await axios.update(url, qs.stringify(
            payload
        ), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'cache-control': 'no-cache',
                'authorization': `Bearer ${gettoken}`
            },
        })
        data = await dump.data
    } catch (error) {
        ToastNotification('error', error)
    }

    return data
}

export const deleteHandler = async (url, payload) => {

    var data;
    let gettoken = await getAccessToken()
    payload.requestId = uuidv4()
    
    try {
        // FIXME Use correct delete payload. 
        let dump = await axios.delete(url, qs.stringify(
            payload
        ), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'cache-control': 'no-cache',
                'authorization': `Bearer ${gettoken}`
            },
        })
        data = await dump.data
    } catch (error) {
        ToastNotification('error', error)
    }

    return data
} 