import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectCurrentUser, selectIsInitialized } from '../store/authSlice';

const ProtectedRoute = ({ children, requiredRole = 'user', redirectTo = '/login' }) => {
    const currentUser = useSelector(selectCurrentUser);
    const isInitialized = useSelector(selectIsInitialized);

    // Show loading while auth state is being restored
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
        );
    }

    // If no user is logged in, redirect to login
    if (!currentUser) {
        return <Navigate to={redirectTo} replace />;
    }

    // If role is required and user doesn't have it, redirect to dashboard
    if (requiredRole === 'admin' && currentUser.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // If role is required and user doesn't have it, redirect to dashboard
    if (requiredRole === 'moderator' && !['admin', 'moderator'].includes(currentUser.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute; 