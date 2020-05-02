import * as axios from 'axios'
import qs from 'qs'

const customHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
};

export const getAccessToken = async () => {
    
    let token;

    token = await axios.post ('https://pluto-office.herokuapp.com/fetch', qs.stringify({
        access : '64dd3ccb319e6f79458bbc7ec83677be'
    }), customHeaders)

    return token;
}

export const postHandler = async (url, payload) => {

    var data; 
    let gettoken = await getAccessToken()
    payload.token = gettoken.data;
    
    try {
        let dump = await axios.post(url, qs.stringify(
            payload
        ), customHeaders)
        data = await dump.data
    } catch (error) {
        alert(error)
    }

    return data
} 


export const getHandler = async (url, payload) => {

    var data; 
    let gettoken = await getAccessToken()
    payload.token = gettoken.data;
    
    try {
        let dump = await axios.get(url, qs.stringify(
            payload
        ), customHeaders)
        data = await dump.data
    } catch (error) {
        alert(error)
    }

    return data
} 

export const updateHandler = async (url, payload) => {

    var data; 
    let gettoken = await getAccessToken()
    payload.token = gettoken.data;
    
    try {
        let dump = await axios.update(url, qs.stringify(
            payload
        ), customHeaders)
        data = await dump.data
    } catch (error) {
        alert(error)
    }

    return data
} 