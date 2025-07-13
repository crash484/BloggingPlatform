import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { selectCurrentUser, logout } from '../store/authSlice';

export default function AdminDashboardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);
    const [userStats, setUserStats] = useState(null);
    const [aiStatus, setAiStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAdminData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            
            console.log('🔍 Debug: Fetching admin data...');
            console.log('🔍 Debug: Current user:', currentUser);
            console.log('🔍 Debug: Token exists:', !!token);

            // Fetch user statistics
            const usersResponse = await fetch('https://bloggingplatform-production.up.railway.app/api/auth/admin', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('🔍 Debug: Users response status:', usersResponse.status);
            
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                console.log('🔍 Debug: Users data received:', usersData);
                setUserStats(usersData);
            } else {
                const errorData = await usersResponse.json();
                console.error('🔍 Debug: Users error:', errorData);
                toast.error(`Failed to load users: ${errorData.message}`);
            }

            // Fetch AI status and challenge details
            const aiResponse = await fetch('https://bloggingplatform-production.up.railway.app/api/auth/admin/daily-challenge/ai-status', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('🔍 Debug: AI response status:', aiResponse.status);

            if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                console.log('🔍 Debug: AI data received:', aiData);
                setAiStatus(aiData);
            } else {
                const errorData = await aiResponse.json();
                console.error('🔍 Debug: AI error:', errorData);
                toast.error(`Admin access denied: ${errorData.message}`);
            }

        } catch (error) {
            console.error('🔍 Debug: Error fetching admin data:', error);
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        fetchAdminData();
    }, [currentUser, navigate, fetchAdminData]);

    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                    <p className="mb-4">You don't have permission to access this page.</p>
                    <p className="mb-4 text-sm text-purple-200">Current role: {currentUser?.role || 'Not logged in'}</p>

                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => {
                            dispatch(logout());
                            navigate('/');
                            toast.success('Logged out successfully!');
                        }}
                        className="mb-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <span className="text-xl">🚪</span>
                        Logout
                    </button>
                    <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-purple-200">Manage users and monitor system status</p>
                </div>

                {/* AI Status Section */}
                {aiStatus && (
                    <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Challenge Generation Status</h2>

                        {/* Today's Challenge Details */}
                        {aiStatus.todaysChallenge && (
                            <div className="bg-white/20 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">📅 Today's Challenge Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-purple-200 text-sm">Topic</p>
                                        <p className="text-white font-semibold">{aiStatus.todaysChallenge.topic}</p>
                                    </div>
                                    <div>
                                        <p className="text-purple-200 text-sm">Category</p>
                                        <p className="text-white font-semibold">{aiStatus.todaysChallenge.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-purple-200 text-sm">Difficulty</p>
                                        <p className="text-white font-semibold">{aiStatus.todaysChallenge.difficulty}</p>
                                    </div>
                                    <div>
                                        <p className="text-purple-200 text-sm">Participants</p>
                                        <p className="text-white font-semibold">{aiStatus.todaysChallenge.participants}</p>
                                    </div>
                                    <div>
                                        <p className="text-purple-200 text-sm">Created At</p>
                                        <p className="text-white font-semibold">
                                            {new Date(aiStatus.todaysChallenge.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Challenge Statistics */}
                        <div className="mt-6 grid grid-cols-1 gap-4">
                            <div className="bg-white/20 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-white">{aiStatus.stats?.totalChallenges || 0}</div>
                                <div className="text-purple-200 text-sm">Total Challenges</div>
                            </div>
                        </div>

                        {/* Error Details */}
                        {aiStatus.aiStatus?.error && (
                            <div className="mt-4 bg-red-500/20 rounded-xl p-4">
                                <h4 className="text-red-300 font-semibold mb-2">AI Error Details</h4>
                                <p className="text-red-200 text-sm">{aiStatus.aiStatus.error}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* User Statistics Section */}
                {userStats && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">👥 User Statistics</h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white/20 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-white">{userStats.totalUsers}</div>
                                <div className="text-purple-200 text-sm">Total Users</div>
                            </div>
                            <div className="bg-white/20 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-white">
                                    {userStats.users?.reduce((sum, user) => sum + user.statistics.totalPosts, 0) || 0}
                                </div>
                                <div className="text-purple-200 text-sm">Total Posts</div>
                            </div>
                            <div className="bg-white/20 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-white">
                                    {userStats.users?.reduce((sum, user) => sum + user.statistics.totalLikes, 0) || 0}
                                </div>
                                <div className="text-purple-200 text-sm">Total Likes</div>
                            </div>
                            <div className="bg-white/20 rounded-xl p-4 text-center">
                                <div className="text-2xl font-bold text-white">
                                    {userStats.users?.reduce((sum, user) => sum + user.statistics.totalComments, 0) || 0}
                                </div>
                                <div className="text-purple-200 text-sm">Total Comments</div>
                            </div>
                        </div>

                        {/* Top Users */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white">🏆 Top Contributors</h3>
                            {userStats.users?.slice(0, 5).map((user, index) => (
                                <div key={user._id} className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl font-bold text-purple-300">#{index + 1}</div>
                                        <div>
                                            <p className="text-white font-semibold">{user.username}</p>
                                            <p className="text-purple-200 text-sm">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-bold">{user.statistics.totalPosts} posts</div>
                                        <div className="text-purple-200 text-sm">{user.statistics.totalLikes} likes</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}