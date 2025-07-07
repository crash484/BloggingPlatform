import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DailyChallenge() {
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTodaysChallenge();
    }, []);

    const fetchTodaysChallenge = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/auth/daily-challenge');
            
            if (!response.ok) {
                throw new Error('Failed to fetch today\'s challenge');
            }

            const data = await response.json();
            setChallenge(data.challenge);
        } catch (err) {
            console.error('Error fetching challenge:', err);
            setError(err.message);
            toast.error('Failed to load today\'s challenge');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptChallenge = () => {
        if (!challenge) return;
        
        // Navigate to the blog editor, passing challenge info via state
        navigate('/blog-editor', { 
            state: { 
                challenge: {
                    topic: challenge.topic,
                    category: challenge.category,
                    description: challenge.description,
                    challengeId: challenge._id
                }
            } 
        });
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl p-8 text-white mb-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-white/20 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-white/20 rounded w-1/4 mb-4"></div>
                    <div className="h-6 bg-white/20 rounded w-full mb-2"></div>
                    <div className="h-20 bg-white/20 rounded w-full mb-6"></div>
                    <div className="h-12 bg-white/20 rounded w-40"></div>
                </div>
            </div>
        );
    }

    if (error || !challenge) {
        return (
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-3xl shadow-xl p-8 text-white mb-8">
                <h2 className="text-3xl font-bold mb-2">❌ Daily Challenge</h2>
                <p className="mb-4 text-pink-100">
                    {error || 'No challenge available today. Please try again later.'}
                </p>
                <button
                    onClick={fetchTodaysChallenge}
                    className="bg-white text-red-600 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-red-100 transition-transform hover:scale-105"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl p-8 text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">🔥 Daily Challenge</h2>
            <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-block bg-white/20 px-3 py-1 rounded-lg text-sm font-semibold">
                    {challenge.category}
                </span>
                <span className="inline-block bg-white/20 px-3 py-1 rounded-lg text-sm font-semibold">
                    {challenge.difficulty}
                </span>
                {challenge.tags && challenge.tags.map((tag, index) => (
                    <span key={index} className="inline-block bg-white/10 px-2 py-1 rounded-lg text-xs">
                        #{tag}
                    </span>
                ))}
            </div>
            <h3 className="text-xl font-semibold mb-2">{challenge.topic}</h3>
            <p className="mb-6 text-purple-100 leading-relaxed">{challenge.description}</p>
            <div className="flex gap-4">
                <button
                    onClick={handleAcceptChallenge}
                    className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-100 transition-transform hover:scale-105"
                >
                    Accept Challenge
                </button>
                <button
                    onClick={fetchTodaysChallenge}
                    className="bg-white/20 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-white/30 transition-transform hover:scale-105"
                >
                    Refresh
                </button>
            </div>
            <div className="mt-4 text-xs text-purple-200">
                Challenge generated on {new Date(challenge.date).toLocaleDateString()}
                {challenge.participants && challenge.participants.length > 0 && (
                    <span className="ml-2">• {challenge.participants.length} participants</span>
                )}
            </div>
        </div>
    );
} 