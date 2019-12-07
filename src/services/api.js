import axios from 'axios';

const api = axios.create({
    baseURL: 'https://backend3.herokuapp.com'
})
//production -> https://backend3.herokuapp.com

export default api;