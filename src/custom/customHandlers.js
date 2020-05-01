import * as axios from 'axios'

const customHeaders = {
    'content-type': 'application/json',
};

export const postHandler = async (url, payload) => {

    var data; 
    
    try {
        let dump = await axios.post(url, { payload }, customHeaders)
        data = await dump.data
    } catch (error) {
        alert(error)
    }

    return data
} 

export const getHandler = async (url, payload) => {

    var data; 
    
    try {
        data = await axios.get(url, { payload }, customHeaders)
    } catch (error) {
        alert(error)
    }

    return data
} 

export const updateHandler = async (url, payload) => {

    var data; 
    
    try {
        data = await axios.update(url, { payload }, customHeaders)
    } catch (error) {
        alert(error)
    }

    return data
} 