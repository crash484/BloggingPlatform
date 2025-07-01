import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectCurrentUser } from '../store/authSlice';

const ProtectedRoute = ({ children, requiredRole = 'user', redirectTo = '/login' }) => {
    const currentUser = useSelector(selectCurrentUser);

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