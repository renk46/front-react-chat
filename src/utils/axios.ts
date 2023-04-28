import axios from "axios";
import { API_HOST_ENDPOINT } from "../config";
import { decode } from 'js-base64';

export const api = axios.create({
    baseURL: API_HOST_ENDPOINT,
    withCredentials: true,
});

export const setAccessToken = (token: string) => {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

function getTimestampInSeconds() {
    return Math.floor(Date.now() / 1000);
}

function validToken(token: string) {
    const _token = JSON.parse(decode(token.split('.')[1]))
    return _token.exp > getTimestampInSeconds()
}

// JSON.parse(decode(token?.access.split('.')[1]))

api.interceptors.request.use(
    async function (config) {
        const t = typeof config.headers.Authorization === 'string' && config.headers.Authorization.split(' ')[1]
        if (t && !validToken(t) && config.headers.Authorization) {
            const token = window.localStorage.getItem("token")
            api.defaults.headers.common["Authorization"] = false
            if (token) {
                const res = await api.post('api/token/refresh/', {
                    "refresh": JSON.parse(token).refresh
                })
                window.localStorage.setItem("token", JSON.stringify({...JSON.parse(token), access: res.data.access}));
                config.headers.Authorization = `Bearer ${res.data.access}`;
            }
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);
