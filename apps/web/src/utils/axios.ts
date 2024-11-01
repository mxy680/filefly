import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // To send cookies with requests
});

api.interceptors.request.use(
    config => {
        // Check if cookies are provided in config headers
        if (config.headers && config.headers['x-cookies']) {
            config.headers['Cookie'] = config.headers['x-cookies'];
            delete config.headers['x-cookies']; // Clean up the temporary header
        }
        return config;
    },
    error => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    async error => {
        const status = error.response?.status;
        const errorCode = error.response?.data?.code || '';

        if (status === 401 && (errorCode === 'TOKEN_EXPIRED' || errorCode === 'NO_ACCESS_TOKEN')) {
            // Attempt to refresh token
            try {
                const response = await api.post('/auth/refresh');
                if (response.status === 200) {
                    // Retry the original request with the new token
                    return api.request(error.config);
                } else {
                    return Promise.reject({ ...error, message: 'Failed to refresh token', redirectTo: '/login' });
                }
            } catch (refreshError) {
                return Promise.reject({ message: 'Failed to refresh token', redirectTo: '/login', ...(typeof refreshError === 'object' ? refreshError : {}) });
            }
        } else if (status === 403) {
            return Promise.reject({ ...error, redirectTo: '/forbidden', message: 'User is not authorized' });
        } else if (status === 500 || status === 502) {
            return Promise.reject({ ...error, redirectTo: '/error', message: 'Server error' });
        }

        return Promise.reject(error); // Handle other errors as usual
    }
);

export default api;
