import React from 'react';
import { useNavigate } from 'react-router-dom';

// Mock daily challenge data
const mockChallenge = {
    topic: 'The Future of Artificial Intelligence',
    category: 'Technology',
    description: 'Write a blog post exploring how AI might shape our world in the next decade. Consider both positive and negative impacts.'
};

export default function DailyChallenge() {
    const navigate = useNavigate();

    const handleAcceptChallenge = () => {
        // Navigate to the blog editor, passing challenge info via state
        navigate('/blog-editor', { state: { challenge: mockChallenge } });
    };

    return (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl p-8 text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">🔥 Daily Challenge</h2>
            <div className="mb-4">
                <span className="inline-block bg-white/20 px-3 py-1 rounded-lg text-sm font-semibold mr-2">{mockChallenge.category}</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{mockChallenge.topic}</h3>
            <p className="mb-6 text-purple-100">{mockChallenge.description}</p>
            <button
                onClick={handleAcceptChallenge}
                className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-100 transition-transform hover:scale-105"
            >
                Accept Challenge
            </button>
        </div>
    );
} 