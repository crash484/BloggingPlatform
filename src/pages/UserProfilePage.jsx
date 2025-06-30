import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    fetchBlogs,
    deleteBlog,
    toggleLike,
    selectAllBlogs,
    selectBlogLoading,
    selectBlogError,
    selectIsDeleting,
    selectIsLiking,
    clearError
} from '../store/blogSlice';
import { selectCurrentUser } from '../store/authSlice';

export default function UserProfilePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userId } = useParams();

    const currentUser = useSelector(selectCurrentUser);
    const blogs = useSelector(selectAllBlogs);
    const isLoading = useSelector(selectBlogLoading);
    const error = useSelector(selectBlogError);
    const isDeleting = useSelector(selectIsDeleting);
    const isLiking = useSelector(selectIsLiking);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        dispatch(fetchBlogs());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Filter blogs to show only the user's blogs
    const userBlogs = useMemo(() => {
        return blogs.filter(blog => blog.author?._id === userId);
    }, [blogs, userId]);

    // Get unique categories from user's blogs
    const categories = useMemo(() => {
        const categorySet = new Set();
        userBlogs.forEach(blog => {
            if (blog.categories && Array.isArray(blog.categories)) {
                blog.categories.forEach(category => categorySet.add(category));
            }
        });
        return Array.from(categorySet).sort();
    }, [userBlogs]);

    // Filter blogs based on search term and category
    const filteredBlogs = useMemo(() => {
        return userBlogs.filter(blog => {
            const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.content.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === 'all' ||
                (blog.categories && blog.categories.includes(selectedCategory));

            return matchesSearch && matchesCategory;
        });
    }, [userBlogs, searchTerm, selectedCategory]);

    const handleEdit = (blogId) => {
        navigate(`/blogs/edit/${blogId}`);
    };

    const handleDelete = async (blogId, blogTitle) => {
        if (window.confirm(`Are you sure you want to delete "${blogTitle}"?`)) {
            try {
                await dispatch(deleteBlog(blogId)).unwrap();
                toast.success('Blog deleted successfully!');
            } catch (err) {
                // Error is handled by the slice and shown via toast
            }
        }
    };

    const handleViewBlog = (blogId) => {
        navigate(`/blogs/${blogId}`);
    };

    const handleCreateBlog = () => {
        navigate('/blogs/create');
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const handleLike = async (blogId, e) => {
        e.stopPropagation();
        if (!currentUser) {
            toast.error('Please login to like this blog');
            return;
        }

        try {
            await dispatch(toggleLike(blogId)).unwrap();
        } catch (err) {
            // Error is handled by the slice and shown via toast
        }
    };

    const isLikedByUser = (blog) => {
        if (!currentUser || !blog?.likes) return false;
        return blog.likes.some(like =>
            typeof like === 'string' ? like === currentUser._id : like._id === currentUser._id
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateContent = (content, maxLength = 150) => {
        // Remove HTML tags for preview
        const plainText = content.replace(/<[^>]*>/g, '');
        if (plainText.length <= maxLength) return plainText;
        return plainText.substring(0, maxLength) + '...';
    };

    // Get user info from the first blog (assuming all blogs have the same author info)
    const userInfo = userBlogs.length > 0 ? userBlogs[0].author : null;

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Please login to view profiles</h2>
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

    if (error && !isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Error loading profile</h2>
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={() => {
                            dispatch(clearError());
                            dispatch(fetchBlogs());
                        }}
                        className="bg-gradient-to-r from-pink-500 to-indigo-500 px-6 py-2 rounded-lg hover:scale-105 transition-transform"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">User Profile</h1>
                        <p className="text-purple-200">View user information and their blogs</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleBackToDashboard}
                            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <span className="text-xl">🏠</span>
                            Back to Dashboard
                        </button>
                        {currentUser._id === userId && (
                            <button
                                onClick={handleCreateBlog}
                                className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <span className="text-xl">✏️</span>
                                Create Blog
                            </button>
                        )}
                    </div>
                </div>

                {/* User Info Section */}
                {userInfo && (
                    <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                                {userInfo.username?.charAt(0).toUpperCase() || userInfo.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {userInfo.username || userInfo.name || 'Unknown User'}
                                </h2>
                                <p className="text-purple-200 mb-4">
                                    {userInfo.email || 'No email provided'}
                                </p>
                                <div className="flex items-center gap-6 text-purple-300">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">📝</span>
                                        <span>{userBlogs.length} Blogs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">❤️</span>
                                        <span>{userBlogs.reduce((total, blog) => total + (blog.likes?.length || 0), 0)} Total Likes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">💬</span>
                                        <span>{userBlogs.reduce((total, blog) => total + (blog.comments?.length || 0), 0)} Total Comments</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Filter Section */}
                {userBlogs.length > 0 && (
                    <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="flex-1">
                                <label htmlFor="search" className="block text-white font-semibold mb-2">
                                    Search Blogs
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by title or content..."
                                        className="w-full px-4 py-3 pl-12 rounded-xl bg-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                    />
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300">
                                        🔍
                                    </span>
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="md:w-64">
                                <label htmlFor="category" className="block text-white font-semibold mb-2">
                                    Filter by Category
                                </label>
                                <select
                                    id="category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/30 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Results Count */}
                        <div className="mt-4 text-purple-200 text-sm">
                            Showing {filteredBlogs.length} of {userBlogs.length} blogs
                            {searchTerm && ` matching "${searchTerm}"`}
                            {selectedCategory !== 'all' && ` in "${selectedCategory}"`}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                )}

                {/* No Blogs State */}
                {!isLoading && userBlogs.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">👤</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No blogs found</h3>
                        <p className="text-purple-200 mb-6">
                            {currentUser._id === userId
                                ? "You haven't written any blogs yet. Start sharing your thoughts!"
                                : "This user hasn't written any blogs yet."
                            }
                        </p>
                        {currentUser._id === userId && (
                            <button
                                onClick={handleCreateBlog}
                                className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
                            >
                                Create Your First Blog
                            </button>
                        )}
                    </div>
                )}

                {/* No Filtered Blogs State */}
                {!isLoading && userBlogs.length > 0 && filteredBlogs.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No blogs found</h3>
                        <p className="text-purple-200 mb-6">Try adjusting your search or filter criteria.</p>
                    </div>
                )}

                {/* Blog Grid */}
                {!isLoading && filteredBlogs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBlogs.map((blog) => (
                            <div
                                key={blog._id}
                                className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden hover:scale-105 transition-transform duration-300"
                            >
                                {/* Blog Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                                        {blog.title}
                                    </h3>

                                    <p className="text-purple-200 text-sm mb-4 line-clamp-3">
                                        {truncateContent(blog.content)}
                                    </p>

                                    {/* Categories */}
                                    {blog.categories && blog.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {blog.categories.map((category, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded-lg"
                                                >
                                                    {category}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Date */}
                                    <div className="text-sm text-purple-300 mb-4">
                                        <span>{formatDate(blog.createdAt)}</span>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm text-purple-300 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <span>❤️</span>
                                                <span>{blog.likes?.length || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>💬</span>
                                                <span>{blog.comments?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewBlog(blog._id)}
                                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:scale-105 transition-transform text-sm"
                                        >
                                            Read More
                                        </button>

                                        <button
                                            onClick={(e) => handleLike(blog._id, e)}
                                            disabled={isLiking}
                                            className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${isLikedByUser(blog)
                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                : 'bg-white/20 text-white hover:bg-white/30'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            title={isLikedByUser(blog) ? 'Unlike' : 'Like'}
                                        >
                                            {isLikedByUser(blog) ? '❤️' : '🤍'}
                                        </button>

                                        {currentUser?._id === blog.author?._id && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(blog._id)}
                                                    className="bg-yellow-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                                                    title="Edit Blog"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(blog._id, blog.title)}
                                                    disabled={isDeleting}
                                                    className="bg-red-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Delete Blog"
                                                >
                                                    🗑️
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
        </div>
    );
} 