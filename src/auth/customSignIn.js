import axios from 'axios'

export const mySignInFunction = async (payload) => {

    const customHeaders = {
        'content-type': 'application/json',
    };

    var data = await axios.post('https://pluto-office.herokuapp.com/login', {
        payload
    }, customHeaders)

    return data
} 