import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { clearUser } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL
export const api = axios.create({
    baseURL:API_URL,
    headers:{
        "Content-Type":"application/json"
    },
    withCredentials:true
})


api.interceptors.request.use(
    async (config) => {
        // Grab the token saved during Sign In / OTP Verification
        const token = await SecureStore.getItemAsync('session_token');

        if (token) {
            
            // Attach the "Badge" to the header
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    async (error) => {
        if (error.response?.status === 401) {
            clearUser();
        }
        return Promise.reject(error);
    }
);