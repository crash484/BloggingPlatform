import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { clearBlogs } from '../store/blogSlice';
import toast from 'react-hot-toast';

export default function Navigation() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = useSelector(state => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearBlogs());
        toast.success('Logged out successfully!');
        navigate('/');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    if (!currentUser) {
        return null; // Don't show navigation for non-authenticated users
    }

    return (
        <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <Link to="/blogs" className="flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        <span className="text-white font-bold text-xl">BlogCraft Pro</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/blogs"
                            className={`px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/blogs')
                                ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white'
                                : 'text-purple-200 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            Blogs
                        </Link>
                        <Link
                            to="/blogs/create"
                            className={`px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/blogs/create')
                                ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white'
                                : 'text-purple-200 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            Create Blog
                        </Link>
                        <Link
                            to={`/profile/${currentUser._id}`}
                            className={`px-3 py-2 rounded-lg font-medium transition-colors ${location.pathname.startsWith('/profile/')
                                ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white'
                                : 'text-purple-200 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            My Profile
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                {currentUser.username?.charAt(0).toUpperCase() || currentUser.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-white font-medium hidden sm:block">
                                {currentUser.username || currentUser.name}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
} 