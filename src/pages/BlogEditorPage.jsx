import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { createBlog, updateBlog, fetchBlogById, selectCurrentBlog, selectIsCreating, selectIsUpdating, selectBlogError, clearError } from '../store/blogSlice';
import { selectCurrentUser } from '../store/authSlice';

export default function BlogEditorPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { blogId } = useParams();
    const isEditing = !!blogId;

    const currentUser = useSelector(selectCurrentUser);
    const currentBlog = useSelector(selectCurrentBlog);
    const isCreating = useSelector(selectIsCreating);
    const isUpdating = useSelector(selectIsUpdating);
    const error = useSelector(selectBlogError);

    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });

    // Fetch blog data if editing
    useEffect(() => {
        if (isEditing && blogId) {
            dispatch(fetchBlogById(blogId));
        }
    }, [dispatch, blogId, isEditing]);

    // Update form data when current blog is loaded
    useEffect(() => {
        if (currentBlog && isEditing) {
            setFormData({
                title: currentBlog.title || '',
                content: currentBlog.content || ''
            });
        }
    }, [currentBlog, isEditing]);

    // Handle errors
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Check if user is authorized to edit
    useEffect(() => {
        if (isEditing && currentBlog && currentUser) {
            if (currentBlog.author._id !== currentUser._id) {
                toast.error('You are not authorized to edit this blog');
                navigate('/blogs');
            }
        }
    }, [isEditing, currentBlog, currentUser, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({
            ...prev,
            content
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        if (!formData.content.trim()) {
            toast.error('Content is required');
            return;
        }

        try {
            if (isEditing) {
                await dispatch(updateBlog({ blogId, blogData: formData })).unwrap();
                toast.success('Blog updated successfully!');
            } else {
                await dispatch(createBlog(formData)).unwrap();
                toast.success('Blog created successfully!');
            }
            navigate('/blogs');
        } catch (err) {
            // Error is handled by the slice and shown via toast
        }
    };

    const handleCancel = () => {
        navigate('/blogs');
    };

    // Quill editor modules and formats
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'color', 'background',
        'align',
        'link', 'image'
    ];

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
        <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
                    </h1>
                    <p className="text-purple-200">
                        {isEditing ? 'Update your blog post below' : 'Share your thoughts with the world'}
                    </p>
                </div>

                {/* Editor Form */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title Input */}
                        <div>
                            <label htmlFor="title" className="block text-white font-semibold mb-2">
                                Blog Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter your blog title..."
                                className="w-full px-4 py-3 rounded-xl bg-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                disabled={isCreating || isUpdating}
                            />
                        </div>

                        {/* Content Editor */}
                        <div>
                            <label className="block text-white font-semibold mb-2">
                                Blog Content
                            </label>
                            <div className="bg-white rounded-xl overflow-hidden">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={handleContentChange}
                                    modules={modules}
                                    formats={formats}
                                    placeholder="Write your blog content here..."
                                    style={{ height: '400px' }}
                                    readOnly={isCreating || isUpdating}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isCreating || isUpdating}
                                className="flex-1 bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isCreating || isUpdating ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {isEditing ? 'Updating...' : 'Creating...'}
                                    </span>
                                ) : (
                                    isEditing ? 'Update Blog' : 'Publish Blog'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isCreating || isUpdating}
                                className="px-8 py-3 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 