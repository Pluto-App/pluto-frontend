import axios from 'axios'

const customHeaders = {
    'content-type': 'application/json',
};

export const postHandler = async (url, payload) => {

    var data = await axios.post(url, {
        payload
    }, customHeaders)

    return data
} 

export const getHandler = async (url, payload) => {

    var data = await axios.get(url, {
        payload
    }, customHeaders)

    return data
} 