import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    fetchBlogById,
    deleteBlog,
    toggleLike,
    addComment,
    selectCurrentBlog,
    selectBlogLoading,
    selectBlogError,
    selectIsDeleting,
    selectIsLiking,
    selectIsCommenting,
    clearError,
    clearCurrentBlog
} from '../store/blogSlice';
import { selectCurrentUser } from '../store/authSlice';

export default function BlogDetailsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { blogId } = useParams();

    const currentUser = useSelector(selectCurrentUser);
    const currentBlog = useSelector(selectCurrentBlog);
    const isLoading = useSelector(selectBlogLoading);
    const error = useSelector(selectBlogError);
    const isDeleting = useSelector(selectIsDeleting);
    const isLiking = useSelector(selectIsLiking);
    const isCommenting = useSelector(selectIsCommenting);

    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        if (blogId) {
            console.log("BlogDetailsPage: Fetching blog with ID:", blogId);
            dispatch(fetchBlogById(blogId));
        }

        // Cleanup when component unmounts
        return () => {
            dispatch(clearCurrentBlog());
        };
    }, [dispatch, blogId]);

    useEffect(() => {
        console.log("BlogDetailsPage: Current user:", currentUser);
        console.log("BlogDetailsPage: Current blog:", currentBlog);
        console.log("BlogDetailsPage: Loading:", isLoading);
        console.log("BlogDetailsPage: Error:", error);
    }, [currentUser, currentBlog, isLoading, error]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleEdit = () => {
        navigate(`/blogs/edit/${blogId}`);
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${currentBlog.title}"?`)) {
            try {
                await dispatch(deleteBlog(blogId)).unwrap();
                toast.success('Blog deleted successfully!');
                navigate('/blogs');
            } catch (err) {
                // Error is handled by the slice and shown via toast
            }
        }
    };

    const handleBackToList = () => {
        navigate('/blogs');
    };

    const handleLike = async () => {
        if (!currentUser) {
            toast.error('Please login to like this blog');
            return;
        }

        try {
            await dispatch(toggleLike(blogId)).unwrap();
            // Success message will be handled by the backend response
        } catch (err) {
            // Error is handled by the slice and shown via toast
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            toast.error('Please login to comment');
            return;
        }

        if (!commentText.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }

        try {
            await dispatch(addComment({ blogId, commentText: commentText.trim() })).unwrap();
            setCommentText('');
            toast.success('Comment added successfully!');
        } catch (err) {
            // Error is handled by the slice and shown via toast
        }
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

    const isLikedByUser = () => {
        if (!currentUser || !currentBlog?.likes) return false;
        return currentBlog.likes.some(like =>
            typeof like === 'string' ? like === currentUser._id : like._id === currentUser._id
        );
    };

    if (!currentUser) {
        console.log("BlogDetailsPage: No current user, showing login prompt");
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Please login to view blog details</h2>
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
        console.log("BlogDetailsPage: Rendering error state");
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Error loading blog</h2>
                    <p className="mb-4">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => {
                                dispatch(clearError());
                                if (blogId) dispatch(fetchBlogById(blogId));
                            }}
                            className="bg-gradient-to-r from-pink-500 to-indigo-500 px-6 py-2 rounded-lg hover:scale-105 transition-transform"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={handleBackToList}
                            className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-2 rounded-lg hover:scale-105 transition-transform"
                        >
                            Back to Blogs
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!currentBlog) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Blog not found</h2>
                    <button
                        onClick={handleBackToList}
                        className="bg-gradient-to-r from-pink-500 to-indigo-500 px-6 py-2 rounded-lg hover:scale-105 transition-transform"
                    >
                        Back to Blogs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={handleBackToList}
                        className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors"
                    >
                        <span className="text-xl">←</span>
                        Back to Blogs
                    </button>
                </div>

                {/* Blog Content */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                    {/* Header */}
                    <div className="p-8 border-b border-white/20">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            {currentBlog.title}
                        </h1>

                        {/* Blog Image */}
                        {currentBlog.imageUrl && (
                            <div className="flex justify-center mb-6">
                                <img
                                    src={currentBlog.imageUrl}
                                    alt="Blog"
                                    className="max-h-80 rounded-xl shadow-lg border border-white/20 object-contain bg-white/10"
                                    style={{ maxWidth: '100%' }}
                                    onError={e => e.target.style.display = 'none'}
                                />
                            </div>
                        )}

                        {/* Author and Date Info */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {currentBlog.author?.username?.charAt(0).toUpperCase() || currentBlog.author?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{currentBlog.author?.username || currentBlog.author?.name || 'Unknown Author'}</p>
                                    <p className="text-purple-300 text-sm">Author</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-purple-300 text-sm">Published on</p>
                                <p className="text-white font-semibold">{formatDate(currentBlog.createdAt)}</p>
                            </div>
                        </div>

                        {/* Like Button and Stats */}
                        <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleLike}
                                    disabled={isLiking}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isLikedByUser()
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <span className="text-xl">
                                        {isLikedByUser() ? '❤️' : '🤍'}
                                    </span>
                                    <span>{currentBlog.likes?.length || 0} Likes</span>
                                </button>

                                <div className="flex items-center gap-2 text-purple-300">
                                    <span className="text-xl">💬</span>
                                    <span>{currentBlog.comments?.length || 0} Comments</span>
                                </div>
                            </div>

                            {/* Action Buttons for Author */}
                            {currentUser?._id === currentBlog.author?._id && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleEdit}
                                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-6 py-2 rounded-xl hover:scale-105 transition-transform flex items-center gap-2"
                                    >
                                        <span>✏️</span>
                                        Edit Blog
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-6 py-2 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        <span>🗑️</span>
                                        {isDeleting ? 'Deleting...' : 'Delete Blog'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Blog Content */}
                    <div className="p-8">
                        <div
                            className="prose prose-lg prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: currentBlog.content }}
                            style={{
                                color: 'white',
                                lineHeight: '1.8',
                                fontSize: '1.1rem'
                            }}
                        />
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Comments</h2>

                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mb-8">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    className="w-full px-4 py-3 rounded-xl bg-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
                                    rows="3"
                                    disabled={isCommenting}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isCommenting || !commentText.trim()}
                                className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none self-end"
                            >
                                {isCommenting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Posting...
                                    </span>
                                ) : (
                                    'Post Comment'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {currentBlog.comments && currentBlog.comments.length > 0 ? (
                            currentBlog.comments.map((comment) => (
                                <div key={comment._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {comment.user?.username?.charAt(0).toUpperCase() || comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white font-semibold">
                                                    {comment.user?.username || comment.user?.name || 'Unknown User'}
                                                </span>
                                                <span className="text-purple-300 text-sm">
                                                    {formatDate(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-purple-200">{comment.text}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">💬</div>
                                <p className="text-purple-200">No comments yet. Be the first to share your thoughts!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-purple-200 text-sm">
                        Enjoyed this blog? Share it with others!
                    </p>
                </div>
            </div>

            <style jsx>{`
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: white;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .prose p {
          margin-bottom: 1.5rem;
          color: #e2e8f0;
        }
        .prose ul, .prose ol {
          color: #e2e8f0;
          margin-bottom: 1.5rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
        }
        .prose blockquote {
          border-left: 4px solid #8b5cf6;
          padding-left: 1rem;
          margin: 2rem 0;
          font-style: italic;
          color: #cbd5e1;
        }
        .prose a {
          color: #8b5cf6;
          text-decoration: underline;
        }
        .prose a:hover {
          color: #a855f7;
        }
        .prose img {
          border-radius: 0.5rem;
          margin: 2rem 0;
        }
        .prose code {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          color: #fbbf24;
        }
        .prose pre {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 2rem 0;
        }
        .prose pre code {
          background: none;
          padding: 0;
          color: #e2e8f0;
        }
      `}</style>
        </div>
    );
} 