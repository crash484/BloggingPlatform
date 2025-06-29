import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchBlogs, selectAllBlogs, selectBlogLoading } from '../store/blogSlice';
import { selectCurrentUser } from '../store/authSlice';
import Navigation from '../components/Navigation';

export default function DashboardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentUser = useSelector(selectCurrentUser);
    const blogs = useSelector(selectAllBlogs);
    const isLoading = useSelector(selectBlogLoading);

    useEffect(() => {
        dispatch(fetchBlogs());
    }, [dispatch]);

    const userBlogs = blogs.filter(blog => blog.author._id === currentUser._id);
    const totalBlogs = blogs.length;
    const userBlogCount = userBlogs.length;

    const handleCreateBlog = () => {
        navigate('/blogs/create');
    };

    const handleViewAllBlogs = () => {
        navigate('/blogs');
    };

    const handleViewMyBlogs = () => {
        navigate('/blogs');
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Please login to continue</h2>
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
        <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
            <Navigation />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Welcome Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Welcome back, {currentUser.name}! 👋
                    </h1>
                    <p className="text-xl text-purple-200">
                        Ready to share your next amazing story?
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-200 text-sm">Total Blogs</p>
                                <p className="text-3xl font-bold text-white">{totalBlogs}</p>
                            </div>
                            <div className="text-4xl">📝</div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-200 text-sm">Your Blogs</p>
                                <p className="text-3xl font-bold text-white">{userBlogCount}</p>
                            </div>
                            <div className="text-4xl">✍️</div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-200 text-sm">Community</p>
                                <p className="text-3xl font-bold text-white">{totalBlogs - userBlogCount}</p>
                            </div>
                            <div className="text-4xl">👥</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                        <div className="text-center">
                            <div className="text-6xl mb-4">✨</div>
                            <h3 className="text-2xl font-bold text-white mb-4">Create New Blog</h3>
                            <p className="text-purple-200 mb-6">
                                Share your thoughts, experiences, and stories with the world
                            </p>
                            <button
                                onClick={handleCreateBlog}
                                className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
                            >
                                Start Writing
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-2xl font-bold text-white mb-4">Explore Blogs</h3>
                            <p className="text-purple-200 mb-6">
                                Discover amazing stories from our community of writers
                            </p>
                            <button
                                onClick={handleViewAllBlogs}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
                            >
                                Browse All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Blogs */}
                {!isLoading && blogs.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Recent Blogs</h3>
                            <button
                                onClick={handleViewAllBlogs}
                                className="text-purple-300 hover:text-white transition-colors"
                            >
                                View All →
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.slice(0, 6).map((blog) => (
                                <div
                                    key={blog._id}
                                    className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/blogs/${blog._id}`)}
                                >
                                    <h4 className="text-white font-semibold mb-2 line-clamp-2">
                                        {blog.title}
                                    </h4>
                                    <div className="flex items-center justify-between text-sm text-purple-300">
                                        <span>{blog.author.name}</span>
                                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && blogs.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🌟</div>
                        <h3 className="text-2xl font-bold text-white mb-4">No blogs yet</h3>
                        <p className="text-purple-200 mb-6">Be the first to share your story!</p>
                        <button
                            onClick={handleCreateBlog}
                            className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
                        >
                            Create Your First Blog
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
        </div>
    );
} 