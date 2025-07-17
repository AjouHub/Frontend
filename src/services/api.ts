import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // CRA는 process.env 사용
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;