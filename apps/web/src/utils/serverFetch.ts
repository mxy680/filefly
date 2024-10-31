async function fetchServer(url: string, options = {}) {
    // Make the initial request
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Ensures cookies are sent with requests
    });
  
    // If the response is 401 and the access token has expired
    if (response.status === 401) {
      const errorData = await response.json();
      
      if (errorData.message === 'Access token expired. Please refresh your session.') {
        // Attempt to refresh the token
        try {
          const refreshResponse = await fetch('/auth/refresh', {
            method: 'POST',
            credentials: 'include', // Include cookies for the refresh request
          });
  
          if (!refreshResponse.ok) {
            throw new Error('Refresh token expired or invalid');
          }
  
          // Retry the original request with the new token
          return fetch(url, {
            ...options,
            credentials: 'include', // Include cookies for the retried request
          });
        } catch (refreshError) {
          // Redirect to login if the refresh fails
          window.location.href = '/login';
          throw refreshError;
        }
      }
    }
  
    return response;
  }
  
  export default fetchServer;
  