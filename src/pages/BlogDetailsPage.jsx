import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchBlogById, deleteBlog, selectCurrentBlog, selectBlogLoading, selectBlogError, selectIsDeleting, clearError, clearCurrentBlog } from '../store/blogSlice';
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

    useEffect(() => {
        if (blogId) {
            dispatch(fetchBlogById(blogId));
        }

        // Cleanup when component unmounts
        return () => {
            dispatch(clearCurrentBlog());
        };
    }, [dispatch, blogId]);

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

    if (!currentUser) {
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

                        {/* Author and Date Info */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {currentBlog.author.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{currentBlog.author.name}</p>
                                    <p className="text-purple-300 text-sm">Author</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-purple-300 text-sm">Published on</p>
                                <p className="text-white font-semibold">{formatDate(currentBlog.createdAt)}</p>
                            </div>
                        </div>

                        {/* Action Buttons for Author */}
                        {currentUser._id === currentBlog.author._id && (
                            <div className="flex gap-3 mt-6">
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