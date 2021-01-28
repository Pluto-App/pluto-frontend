import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultOptions = {
    autoClose: 3000,
    position: toast.POSITION.BOTTOM_RIGHT,
    pauseOnHover: false,
    hideProgressBar: false,
    closeOnClick: true,
    draggable: true,
    progress: undefined
};

export default function ToastNotification(condition, content, options) {
    
    var toastOptions = {...defaultOptions, ...options};

    switch (condition) {
        case 'success':
            toast.success(content, toastOptions);
            break;
        case 'error':
            toast.error(content, toastOptions);
            break;
        case 'info':
            toast.info(content, toastOptions);
            break;
        case 'warn':
            toast.warn(content, toastOptions);
            break;
        default:
            toast(content, toastOptions);
            break;
    }
}