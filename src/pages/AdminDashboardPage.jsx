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
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPostDetails, setShowPostDetails] = useState(false);

    // Fetch real user data from the API
    useEffect(() => {
        fetchUserStatistics();
    }, []);

    const fetchUserStatistics = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:5000/api/auth/admin', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                setUsers(data.users);
            } else {
                toast.error(data.message || 'Failed to fetch user statistics');
            }
        } catch (err) {
            toast.error('Network error. Please check your connection.');
            console.error('Error fetching user statistics:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserAction = (userId, action) => {
        // Mock user actions for now
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

    const handleShowPostDetails = (user) => {
        setSelectedUser(user);
        setShowPostDetails(true);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                    <p className="mb-4">Please login to access this page.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-gradient-to-r from-pink-500 to-indigo-500 px-6 py-2 rounded-lg hover:scale-105 transition-transform"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (currentUser.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                    <p className="mb-4">You don't have admin privileges.</p>
                    <p className="mb-4 text-purple-200">Current role: {currentUser.role || 'user'}</p>
                    
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-2 rounded-lg hover:scale-105 transition-transform"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Calculate total statistics
    const totalPosts = users.reduce((sum, user) => sum + user.statistics.totalPosts, 0);
    const totalLikes = users.reduce((sum, user) => sum + user.statistics.totalLikes, 0);
    const totalComments = users.reduce((sum, user) => sum + user.statistics.totalComments, 0);

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
                        <button
                            onClick={fetchUserStatistics}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <span className="text-xl">🔄</span>
                            Refresh Data
                        </button>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-purple-200">Manage users and monitor platform activity</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-white">{users.length}</div>
                        <div className="text-purple-200">Total Users</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-white">{totalPosts}</div>
                        <div className="text-purple-200">Total Posts</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-white">{totalLikes}</div>
                        <div className="text-purple-200">Total Likes</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-white">{totalComments}</div>
                        <div className="text-purple-200">Total Comments</div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
                    <div className="flex space-x-1 mb-6 bg-white/10 rounded-lg p-1">
                        {['overview', 'users', 'statistics'].map((tab) => (
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

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                            <p className="text-white mt-4">Loading user statistics...</p>
                        </div>
                    ) : (
                        <div>
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-4">Top Contributors</h3>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            {users.slice(0, 5).map((user) => (
                                                <div key={user._id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                                            {user.username?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-medium">{user.username}</div>
                                                            <div className="text-purple-200 text-sm">{user.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-white font-semibold">{user.statistics.totalPosts} posts</div>
                                                        <div className="text-purple-200 text-sm">{user.statistics.totalLikes} likes</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Users Tab */}
                            {activeTab === 'users' && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4">User Management</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/20">
                                                    <th className="py-3 px-4 text-white font-medium">User</th>
                                                    <th className="py-3 px-4 text-white font-medium">Role</th>
                                                    <th className="py-3 px-4 text-white font-medium">Posts</th>
                                                    <th className="py-3 px-4 text-white font-medium">Engagement</th>
                                                    <th className="py-3 px-4 text-white font-medium">Joined</th>
                                                    <th className="py-3 px-4 text-white font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((user) => (
                                                    <tr key={user._id} className="border-b border-white/10">
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                                                </div>
                                                                <div>
                                                                    <div className="text-white font-medium">{user.username}</div>
                                                                    <div className="text-purple-200 text-sm">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-white">
                                                            {user.statistics.totalPosts}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="text-white text-sm">
                                                                <div>❤️ {user.statistics.totalLikes}</div>
                                                                <div>💬 {user.statistics.totalComments}</div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-purple-200">
                                                            {formatDate(user.createdAt)}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleShowPostDetails(user)}
                                                                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                                                >
                                                                    View Posts
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUserAction(user._id, 'suspend')}
                                                                    className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                                                                >
                                                                    Suspend
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

                            {/* Statistics Tab */}
                            {activeTab === 'statistics' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-white mb-4">Platform Statistics</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white/5 rounded-lg p-6">
                                            <h4 className="text-lg font-semibold text-white mb-4">Most Active Users</h4>
                                            {users.slice(0, 3).map((user, index) => (
                                                <div key={user._id} className="flex items-center justify-between py-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-bold">#{index + 1}</span>
                                                        <span className="text-purple-200">{user.username}</span>
                                                    </div>
                                                    <span className="text-white">{user.statistics.totalPosts} posts</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-6">
                                            <h4 className="text-lg font-semibold text-white mb-4">Most Liked Users</h4>
                                            {users.sort((a, b) => b.statistics.totalLikes - a.statistics.totalLikes).slice(0, 3).map((user, index) => (
                                                <div key={user._id} className="flex items-center justify-between py-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-bold">#{index + 1}</span>
                                                        <span className="text-purple-200">{user.username}</span>
                                                    </div>
                                                    <span className="text-white">{user.statistics.totalLikes} likes</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Post Details Modal */}
                {showPostDetails && selectedUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-hidden">
                            <div className="p-6 border-b border-white/20">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-white">
                                        {selectedUser.username}'s Posts ({selectedUser.statistics.totalPosts})
                                    </h3>
                                    <button
                                        onClick={() => setShowPostDetails(false)}
                                        className="text-white hover:text-red-400 text-2xl"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {selectedUser.posts.length === 0 ? (
                                    <div className="text-center text-purple-200 py-8">
                                        <div className="text-4xl mb-4">📝</div>
                                        <p>This user hasn't posted any blogs yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedUser.posts.map((post) => (
                                            <div key={post._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-lg font-semibold text-white">{post.title}</h4>
                                                    <span className="text-purple-200 text-sm">{formatDate(post.createdAt)}</span>
                                                </div>
                                                <p className="text-purple-200 text-sm mb-3">{post.content}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="text-purple-200">
                                                            ❤️ {post.likesCount} likes
                                                        </span>
                                                        <span className="text-purple-200">
                                                            💬 {post.commentsCount} comments
                                                        </span>
                                                    </div>
                                                    {post.categories && post.categories.length > 0 && (
                                                        <div className="flex gap-1">
                                                            {post.categories.slice(0, 2).map((category, index) => (
                                                                <span key={index} className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded">
                                                                    {category}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 