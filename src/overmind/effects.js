import * as axios from 'axios'
import qs from 'qs'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const customHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'cache-control': 'no-cache'
};

const options = {
    // onOpen: props => console.log(props.foo),
    // onClose: props => console.log(props.foo),
    autoClose: 2000,
    position: toast.POSITION.BOTTOM_RIGHT,
    pauseOnHover: true,
};

const accessIdstring = () => {
    let result = ""
    let randomString = "79z1v2ecbcffc48d2dexzd6r69dr32o2129bf276eedcc03c0be2q5a23adc2e3mm6a52w4694txy675w97295zl7nb3c4r3fc2e2pd4c72c8f3de40261a0"
    for (var i = 0; i < randomString.length; i += 1) {
        result += randomString.charAt(Math.floor(Math.random() * randomString.length));
    }
    return result
}

export const getAccessToken = async () => {

    let accessString = accessIdstring()

    let token = await axios.post(process.env.REACT_APP_FETCH_URL, qs.stringify({
        accessId: accessString
    }), customHeaders)

    return token.data.accessToken;
}

export const postHandler = async (url, payload) => {

    var data;
    let gettoken = await getAccessToken()

    try {
        let dump = await axios.post(url, qs.stringify(
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
        toast.error(error, options);
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
        ), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'cache-control': 'no-cache',
                'authorization': `Bearer ${gettoken}`
            },
        })
        data = await dump.data
    } catch (error) {
        toast.error(error, options);
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
        ), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'cache-control': 'no-cache',
                'authorization': `Bearer ${gettoken}`
            },
        })
        data = await dump.data
    } catch (error) {
        toast.error(error, options);
    }

    return data
}

export const deleteHandler = async (url, payload) => {

    var data;
    let gettoken = await getAccessToken()
    payload.token = gettoken.data;

    try {
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
        toast.error(error, options);
    }

    return data
} 