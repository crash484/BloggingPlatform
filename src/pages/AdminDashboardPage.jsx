import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { selectCurrentUser } from '../store/authSlice';

export default function AdminDashboardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);

    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Mock data for demonstration (in real app, this would come from API)
    useEffect(() => {
        // Simulate loading data
        setIsLoading(true);
        setTimeout(() => {
            setUsers([
                { _id: '1', username: 'john_doe', email: 'john@example.com', role: 'user', createdAt: '2024-01-15', status: 'active' },
                { _id: '2', username: 'jane_smith', email: 'jane@example.com', role: 'moderator', createdAt: '2024-01-10', status: 'active' },
                { _id: '3', username: 'admin_user', email: 'admin@example.com', role: 'admin', createdAt: '2024-01-01', status: 'active' },
                { _id: '4', username: 'bob_wilson', email: 'bob@example.com', role: 'user', createdAt: '2024-01-20', status: 'suspended' },
            ]);
            setBlogs([
                { _id: '1', title: 'Getting Started with React', author: 'john_doe', status: 'published', createdAt: '2024-01-15', views: 150 },
                { _id: '2', title: 'Advanced JavaScript Tips', author: 'jane_smith', status: 'published', createdAt: '2024-01-12', views: 89 },
                { _id: '3', title: 'Draft: CSS Best Practices', author: 'bob_wilson', status: 'draft', createdAt: '2024-01-18', views: 0 },
                { _id: '4', title: 'Web Development Trends', author: 'admin_user', status: 'published', createdAt: '2024-01-05', views: 234 },
            ]);
            setIsLoading(false);
        }, 1000);
    }, []);

    const handleUserAction = (userId, action) => {
        // Mock user actions
        if (action === 'suspend') {
            setUsers(prev => prev.map(user =>
                user._id === userId ? { ...user, status: 'suspended' } : user
            ));
            toast.success('User suspended successfully');
        } else if (action === 'activate') {
            setUsers(prev => prev.map(user =>
                user._id === userId ? { ...user, status: 'active' } : user
            ));
            toast.success('User activated successfully');
        } else if (action === 'delete') {
            setUsers(prev => prev.filter(user => user._id !== userId));
            toast.success('User deleted successfully');
        }
    };

    const handleBlogAction = (blogId, action) => {
        // Mock blog actions
        if (action === 'approve') {
            setBlogs(prev => prev.map(blog =>
                blog._id === blogId ? { ...blog, status: 'published' } : blog
            ));
            toast.success('Blog approved successfully');
        } else if (action === 'reject') {
            setBlogs(prev => prev.map(blog =>
                blog._id === blogId ? { ...blog, status: 'rejected' } : blog
            ));
            toast.success('Blog rejected successfully');
        } else if (action === 'delete') {
            setBlogs(prev => prev.filter(blog => blog._id !== blogId));
            toast.success('Blog deleted successfully');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
            case 'published':
                return 'bg-green-100 text-green-800';
            case 'suspended':
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'moderator':
                return 'bg-blue-100 text-blue-800';
            case 'user':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                    <p className="mb-4">You don't have permission to access this page.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-gradient-to-r from-pink-500 to-indigo-500 px-6 py-2 rounded-lg hover:scale-105 transition-transform"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <span className="text-xl">🏠</span>
                            Back to Dashboard
                        </button>
                        <div></div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-purple-200">Manage users and content</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-white">{users.length}</div>
                        <div className="text-purple-200">Total Users</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-white">{blogs.length}</div>
                        <div className="text-purple-200">Total Blogs</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-white">
                            {blogs.filter(blog => blog.status === 'published').length}
                        </div>
                        <div className="text-purple-200">Published Blogs</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-white">
                            {blogs.filter(blog => blog.status === 'draft').length}
                        </div>
                        <div className="text-purple-200">Draft Blogs</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
                    <div className="flex space-x-1 mb-6 bg-white/10 rounded-lg p-1">
                        {['overview', 'users', 'blogs'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === tab
                                    ? 'bg-white text-gray-900'
                                    : 'text-white hover:bg-white/20'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                            <p className="text-white mt-4">Loading...</p>
                        </div>
                    ) : (
                        <div>
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-4">Recent Users</h3>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            {users.slice(0, 3).map((user) => (
                                                <div key={user._id} className="flex items-center justify-between py-2">
                                                    <div>
                                                        <div className="text-white font-medium">{user.username}</div>
                                                        <div className="text-purple-200 text-sm">{user.email}</div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-4">Recent Blogs</h3>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            {blogs.slice(0, 3).map((blog) => (
                                                <div key={blog._id} className="flex items-center justify-between py-2">
                                                    <div>
                                                        <div className="text-white font-medium">{blog.title}</div>
                                                        <div className="text-purple-200 text-sm">by {blog.author}</div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(blog.status)}`}>
                                                        {blog.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4">User Management</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/20">
                                                    <th className="py-3 px-4 text-white font-medium">User</th>
                                                    <th className="py-3 px-4 text-white font-medium">Role</th>
                                                    <th className="py-3 px-4 text-white font-medium">Status</th>
                                                    <th className="py-3 px-4 text-white font-medium">Joined</th>
                                                    <th className="py-3 px-4 text-white font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((user) => (
                                                    <tr key={user._id} className="border-b border-white/10">
                                                        <td className="py-3 px-4">
                                                            <div>
                                                                <div className="text-white font-medium">{user.username}</div>
                                                                <div className="text-purple-200 text-sm">{user.email}</div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                                {user.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-purple-200">
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex space-x-2">
                                                                {user.status === 'active' ? (
                                                                    <button
                                                                        onClick={() => handleUserAction(user._id, 'suspend')}
                                                                        className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                                                                    >
                                                                        Suspend
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleUserAction(user._id, 'activate')}
                                                                        className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                                                    >
                                                                        Activate
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleUserAction(user._id, 'delete')}
                                                                    className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'blogs' && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4">Blog Management</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/20">
                                                    <th className="py-3 px-4 text-white font-medium">Title</th>
                                                    <th className="py-3 px-4 text-white font-medium">Author</th>
                                                    <th className="py-3 px-4 text-white font-medium">Status</th>
                                                    <th className="py-3 px-4 text-white font-medium">Views</th>
                                                    <th className="py-3 px-4 text-white font-medium">Created</th>
                                                    <th className="py-3 px-4 text-white font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {blogs.map((blog) => (
                                                    <tr key={blog._id} className="border-b border-white/10">
                                                        <td className="py-3 px-4">
                                                            <div className="text-white font-medium">{blog.title}</div>
                                                        </td>
                                                        <td className="py-3 px-4 text-purple-200">{blog.author}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(blog.status)}`}>
                                                                {blog.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-purple-200">{blog.views}</td>
                                                        <td className="py-3 px-4 text-purple-200">
                                                            {new Date(blog.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex space-x-2">
                                                                {blog.status === 'draft' && (
                                                                    <button
                                                                        onClick={() => handleBlogAction(blog._id, 'approve')}
                                                                        className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                )}
                                                                {blog.status === 'draft' && (
                                                                    <button
                                                                        onClick={() => handleBlogAction(blog._id, 'reject')}
                                                                        className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleBlogAction(blog._id, 'delete')}
                                                                    className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 