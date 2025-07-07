import React from 'react';
import { useNavigate } from 'react-router-dom';

// Mock leaderboard data
const leaderboard = [
    {
        rank: 1,
        username: 'Alice',
        title: 'AI: Friend or Foe?',
        badge: 'gold',
    },
    {
        rank: 2,
        username: 'Bob',
        title: 'The Bright Side of AI',
        badge: 'silver',
    },
    {
        rank: 3,
        username: 'Charlie',
        title: 'AI in 2030',
        badge: 'bronze',
    },
    {
        rank: 4,
        username: 'Dana',
        title: 'AI for Good',
        badge: null,
    },
    {
        rank: 5,
        username: 'Eve',
        title: 'AI and Society',
        badge: null,
    },
];

// Mock user badges
const yourBadges = [
    { type: 'gold', label: 'Gold Winner (May 2024)' },
    { type: 'silver', label: 'Silver Winner (April 2024)' },
    { type: 'streak', label: '7-Day Challenge Streak' },
];

function BadgeIcon({ type }) {
    if (type === 'gold') return <span title="Gold" className="text-yellow-400 text-2xl">🥇</span>;
    if (type === 'silver') return <span title="Silver" className="text-gray-300 text-2xl">🥈</span>;
    if (type === 'bronze') return <span title="Bronze" className="text-amber-700 text-2xl">🥉</span>;
    if (type === 'streak') return <span title="Streak" className="text-orange-400 text-2xl">🔥</span>;
    return null;
}

export default function ChallengeLeaderboardPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 py-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Back to Dashboard Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <span className="text-xl">🏠</span>
                    Back to Dashboard
                </button>
                <h1 className="text-4xl font-bold text-white mb-6 text-center">🏆 Daily Challenge Leaderboard</h1>
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mb-10">
                    <table className="w-full text-white">
                        <thead>
                            <tr className="text-purple-200 text-lg">
                                <th className="py-2">Rank</th>
                                <th className="py-2">User</th>
                                <th className="py-2">Blog Title</th>
                                <th className="py-2">Badge</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry) => (
                                <tr key={entry.rank} className="text-center border-b border-white/10 last:border-b-0">
                                    <td className="py-3 font-bold">{entry.rank}</td>
                                    <td className="py-3">{entry.username}</td>
                                    <td className="py-3 italic">{entry.title}</td>
                                    <td className="py-3">{entry.badge && <BadgeIcon type={entry.badge} />}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Your Badges</h2>
                    <div className="flex flex-wrap gap-4">
                        {yourBadges.map((badge, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-white">
                                <BadgeIcon type={badge.type} />
                                <span>{badge.label}</span>
                            </div>
                        ))}
                        {yourBadges.length === 0 && <span className="text-purple-200">No badges yet. Join a challenge!</span>}
                    </div>
                </div>
            </div>
        </div>
    );
} 