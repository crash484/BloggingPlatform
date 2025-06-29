import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchBlogs, deleteBlog, selectAllBlogs, selectBlogLoading, selectBlogError, selectIsDeleting, clearError } from '../store/blogSlice';
import { selectCurrentUser } from '../store/authSlice';

export default function BlogListPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentUser = useSelector(selectCurrentUser);
    const blogs = useSelector(selectAllBlogs);
    const isLoading = useSelector(selectBlogLoading);
    const error = useSelector(selectBlogError);
    const isDeleting = useSelector(selectIsDeleting);

    useEffect(() => {
        dispatch(fetchBlogs());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

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

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Please login to view blogs</h2>
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
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Blog Posts</h1>
                        <p className="text-purple-200">Discover amazing stories from our community</p>
                    </div>
                    <button
                        onClick={handleCreateBlog}
                        className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <span className="text-xl">✏️</span>
                        Create Blog
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                )}

                {/* Blog List */}
                {!isLoading && blogs.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No blogs yet</h3>
                        <p className="text-purple-200 mb-6">Be the first to share your story!</p>
                        <button
                            onClick={handleCreateBlog}
                            className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
                        >
                            Create Your First Blog
                        </button>
                    </div>
                )}

                {/* Blog Grid */}
                {!isLoading && blogs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((blog) => (
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

                                    {/* Author and Date */}
                                    <div className="flex items-center justify-between text-sm text-purple-300 mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {blog.author.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{blog.author.name}</span>
                                        </div>
                                        <span>{formatDate(blog.createdAt)}</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewBlog(blog._id)}
                                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:scale-105 transition-transform text-sm"
                                        >
                                            Read More
                                        </button>

                                        {currentUser._id === blog.author._id && (
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