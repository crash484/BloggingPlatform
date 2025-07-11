import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import toast from 'react-hot-toast';

function BadgeIcon({ type }) {
    if (type === 'gold') return <span title="Gold" className="text-yellow-400 text-2xl">🥇</span>;
    if (type === 'silver') return <span title="Silver" className="text-gray-300 text-2xl">🥈</span>;
    if (type === 'bronze') return <span title="Bronze" className="text-amber-700 text-2xl">🥉</span>;
    if (type === 'streak') return <span title="Streak" className="text-orange-400 text-2xl">🔥</span>;
    return null;
}

export default function ChallengeLeaderboardPage() {
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('all');
    const [stats, setStats] = useState(null);

    const fetchLeaderboard = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/auth/daily-challenge/leaderboard?timeframe=${timeframe}&limit=10`);

            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }

            const data = await response.json();
            setLeaderboard(data.leaderboard);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    }, [timeframe]);

    const fetchStats = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch('http://localhost:5000/api/auth/daily-challenge/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard();
        fetchStats();
    }, [fetchLeaderboard, fetchStats]);

    const getBadgeForRank = (rank) => {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return 'bronze';
        return null;
    };

    const generateUserBadges = (userStats) => {
        const badges = [];
        const userEntry = leaderboard.find(entry => entry.username === currentUser?.name);

        if (userEntry) {
            const rank = leaderboard.indexOf(userEntry) + 1;
            const badgeType = getBadgeForRank(rank);
            if (badgeType) {
                badges.push({
                    type: badgeType,
                    label: `${badgeType.charAt(0).toUpperCase() + badgeType.slice(1)} Winner (${timeframe === 'all' ? 'All Time' : timeframe.charAt(0).toUpperCase() + timeframe.slice(1)})`
                });
            }

            if (userEntry.challengesCompleted >= 7) {
                badges.push({
                    type: 'streak',
                    label: `${userEntry.challengesCompleted}-Challenge Contributor`
                });
            }
        }

        return badges;
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Please login to view leaderboard</h2>
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back to Dashboard Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <span className="text-xl">🏠</span>
                    Back to Dashboard
                </button>

                <h1 className="text-4xl font-bold text-white mb-6 text-center">🏆 Daily Challenge Leaderboard</h1>

                {/* Stats Section */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 text-center">
                            <div className="text-2xl font-bold text-white">{stats.totalChallenges}</div>
                            <div className="text-purple-200 text-sm">Total Challenges</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 text-center">
                            <div className="text-2xl font-bold text-white">{stats.activeChallenges}</div>
                            <div className="text-purple-200 text-sm">Active Challenges</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 text-center">
                            <div className="text-2xl font-bold text-white">{stats.totalParticipations}</div>
                            <div className="text-purple-200 text-sm">Total Participations</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 text-center">
                            <div className="text-2xl font-bold text-white">{stats.todaysChallenge ? '✅' : '❌'}</div>
                            <div className="text-purple-200 text-sm">Today's Challenge</div>
                        </div>
                    </div>
                )}

                {/* Timeframe Filter */}
                <div className="mb-6 flex justify-center">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-2 flex gap-2">
                        {['all', 'month', 'week'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setTimeframe(period)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${timeframe === period
                                    ? 'bg-purple-500 text-white'
                                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)} Time
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mb-10">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <div className="text-white">Loading leaderboard...</div>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-8 text-purple-200">
                            No participants found for this timeframe.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-white">
                                <thead>
                                    <tr className="text-purple-200 text-lg border-b border-white/20">
                                        <th className="py-4 text-left">Rank</th>
                                        <th className="py-4 text-left">User</th>
                                        <th className="py-4 text-center">Challenges Completed</th>
                                        <th className="py-4 text-center">Last Participation</th>
                                        <th className="py-4 text-center">Badge</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((entry, index) => {
                                        const rank = index + 1;
                                        const badgeType = getBadgeForRank(rank);
                                        const isCurrentUser = currentUser && entry.username === currentUser.name;

                                        return (
                                            <tr
                                                key={entry._id}
                                                className={`border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors ${isCurrentUser ? 'bg-purple-500/20' : ''
                                                    }`}
                                            >
                                                <td className="py-4 font-bold text-xl">
                                                    {rank}
                                                    {isCurrentUser && <span className="ml-2 text-yellow-400">👤</span>}
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        {entry.avatarUrl ? (
                                                            <img
                                                                src={entry.avatarUrl}
                                                                alt={entry.username}
                                                                className="w-8 h-8 rounded-full border border-white/20"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-purple-500/50 flex items-center justify-center text-sm font-bold">
                                                                {entry.username.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="font-semibold">{entry.username}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center text-xl font-bold text-purple-300">
                                                    {entry.challengesCompleted}
                                                </td>
                                                <td className="py-4 text-center text-sm text-purple-200">
                                                    {new Date(entry.lastParticipation).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 text-center">
                                                    {badgeType && <BadgeIcon type={badgeType} />}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* User Badges Section */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Your Achievements</h2>
                    <div className="flex flex-wrap gap-4">
                        {generateUserBadges().map((badge, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-white">
                                <BadgeIcon type={badge.type} />
                                <span>{badge.label}</span>
                            </div>
                        ))}
                        {generateUserBadges().length === 0 && (
                            <div className="text-purple-200 text-center w-full py-4">
                                <p className="mb-2">No achievements yet. Join a challenge to earn your first badge!</p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-gradient-to-r from-pink-500 to-indigo-500 px-6 py-2 rounded-lg hover:scale-105 transition-transform"
                                >
                                    Take Today's Challenge
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 