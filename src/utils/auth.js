import { clearSession } from '../store/authSlice';

// Check if token is expired
export const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp < currentTime;
    } catch (error) {
        return true;
    }
};

// Create an axios interceptor or fetch wrapper to handle token expiration
export const handleTokenExpiration = (dispatch, navigate) => {
    const token = localStorage.getItem('authToken');
    
    if (token && isTokenExpired(token)) {
        dispatch(clearSession());
        navigate('/login');
        return true;
    }
    
    return false;
};

// Enhanced fetch with automatic token handling
export const authenticatedFetch = async (url, options = {}, dispatch, navigate) => {
    const token = localStorage.getItem('authToken');
    
    // Check if token is expired before making request
    if (handleTokenExpiration(dispatch, navigate)) {
        throw new Error('Session expired');
    }
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers,
    });
    
    // Handle 401 responses (unauthorized)
    if (response.status === 401) {
        dispatch(clearSession());
        navigate('/login');
        throw new Error('Session expired');
    }
    
    return response;
};

// Window/tab close event listener to clean up
export const setupSessionCleanup = () => {
    const handleBeforeUnload = () => {
         localStorage.removeItem('authToken');
         localStorage.removeItem('authUser');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
};
