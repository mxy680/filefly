import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // To send cookies
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 500 || error.response?.status === 502) {
            window.location.href = '/error';
            return Promise.reject(error);
        }

        if (error.response?.status === 403) {
            window.location.href = '/forbidden';
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            const errorCode = error.response?.data?.code || '';

            if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'NO_ACCESS_TOKEN') {
                // Refresh Access Token
                try {
                    const response = await api.post('/auth/refresh');
                    if (response.status === 200) {
                        // Retry the original request with the new token and return the response
                        return api.request(error.config);
                    } else {
                        window.location.href = '/';
                    }
                } catch (refreshError) {
                    window.location.href = '/';
                    return Promise.reject(refreshError);
                }
            } else {
                // Redirect to login page for other 401 errors
                window.location.href = '/';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error); // Ensure any other error is rejected
    }
);

export default api;
