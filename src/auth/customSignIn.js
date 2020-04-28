import axios from 'axios'

export const mySignInFunction = async (payload) => {
    
    const customHeaders = {
        'content-type': 'application/json',
    };

    const resp = await axios.post('http://localhost:7500/login', {
        payload
    }, customHeaders).then(response => {
        // test response here. 
    }).catch(error => {
        if(!error.response) {
            // Error Handle
        } else {
            const code = error.response.status
            const response = error.response.data
            alert(code + ", " + response)
        }
    })

    return resp
} 