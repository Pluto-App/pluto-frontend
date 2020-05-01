import * as axios from 'axios'
import qs from 'qs'

const customHeaders = {
    'content-type': 'application/json',
    // 'Content-Type': 'application/x-www-form-urlencoded',
};

export const postHandler = async (url, payload) => {

    var data; 
    alert(qs.stringify(payload))
    try {
        let dump = await axios.post(url, qs.stringify(payload), customHeaders)
        data = await dump.data
    } catch (error) {
        alert(error)
    }

    return data
} 


export const getHandler = async (url, payload) => {

    var data; 
    
    try {
        let dump = await axios.get(url, qs.stringify(payload), customHeaders)
        data = await dump.data
    } catch (error) {
        alert(error)
    }

    return data
} 

export const updateHandler = async (url, payload) => {

    var data; 
    
    try {
        let dump = await axios.update(url, qs.stringify(payload), customHeaders)
        data = await dump.data
    } catch (error) {
        alert(error)
    }

    return data
} 