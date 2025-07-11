import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { createBlog, updateBlog, fetchBlogById, selectCurrentBlog, selectIsCreating, selectIsUpdating, selectBlogError, clearError } from '../store/blogSlice';
import { selectCurrentUser } from '../store/authSlice';
import { suggestTitle } from '../utils/gemini';

export default function BlogEditorPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { blogId } = useParams();
    const isEditing = !!blogId;

    // Check for challenge in navigation state
    const challenge = location.state?.challenge;

    const currentUser = useSelector(selectCurrentUser);
    const currentBlog = useSelector(selectCurrentBlog);
    const isCreating = useSelector(selectIsCreating);
    const isUpdating = useSelector(selectIsUpdating);
    const error = useSelector(selectBlogError);

    const [formData, setFormData] = useState({
        title: challenge && !isEditing ? challenge.topic : '',
        content: '',
        categories: challenge && !isEditing ? [challenge.category] : [],
        image: ''
    });

    const [newCategory, setNewCategory] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [hasParticipated, setHasParticipated] = useState(false);
    const [isCheckingParticipation, setIsCheckingParticipation] = useState(false);

    // Predefined categories
    const predefinedCategories = [
        'Technology', 'Travel', 'Food', 'Health', 'Fitness',
        'Education', 'Business', 'Entertainment', 'Sports',
        'Politics', 'Science', 'Art', 'Music', 'Books', 'Movies'
    ];

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
                content: currentBlog.content || '',
                categories: currentBlog.categories || [],
                image: currentBlog.imageUrl || ''
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

    // Check if user has already participated in today's challenge
    useEffect(() => {
        const checkParticipation = async () => {
            if (challenge && challenge.challengeId && currentUser && !isEditing) {
                setIsCheckingParticipation(true);
                try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch(`http://localhost:5000/api/auth/daily-challenge/${challenge.challengeId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const hasUserParticipated = data.challenge.participants.some(
                            participant => participant.user._id === currentUser._id
                        );
                        setHasParticipated(hasUserParticipated);
                    }
                } catch (error) {
                    console.error('Error checking participation:', error);
                } finally {
                    setIsCheckingParticipation(false);
                }
            }
        };

        checkParticipation();
    }, [challenge, currentUser, isEditing]);

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

    const handleAddCategory = () => {
        if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
            setFormData(prev => ({
                ...prev,
                categories: [...prev.categories, newCategory.trim()]
            }));
            setNewCategory('');
        }
    };

    const handleRemoveCategory = (categoryToRemove) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.filter(cat => cat !== categoryToRemove)
        }));
    };

    const handlePredefinedCategoryClick = (category) => {
        if (!formData.categories.includes(category)) {
            setFormData(prev => ({
                ...prev,
                categories: [...prev.categories, category]
            }));
        }
    };

    const handleSuggestTitle = async () => {
        if (!formData.content.trim()) {
            toast.error('Please write some content first!');
            return;
        }
        setIsSuggesting(true);
        try {
            const suggestion = await suggestTitle(formData.content);
            setFormData(prev => ({ ...prev, title: suggestion }));
            toast.success('Title suggested!');
        } catch (err) {
            toast.error('Failed to suggest title.');
        } finally {
            setIsSuggesting(false);
        }
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
            // Prepare blog data with correct field names for backend
            const blogData = {
                title: formData.title,
                content: formData.content,
                categories: formData.categories,
                imageUrl: formData.image // Map 'image' to 'imageUrl' for backend
            };

            let result;
            if (isEditing) {
                console.log("Updating blog with data:", blogData); // Debug log
                result = await dispatch(updateBlog({ blogId, blogData })).unwrap();
                toast.success('Blog updated successfully!');
            } else {
                result = await dispatch(createBlog(blogData)).unwrap();
                toast.success('Blog created successfully!');

                // If this blog was created for a challenge, submit it to the challenge
                if (challenge && challenge.challengeId && result._id && !hasParticipated) {
                    try {
                        const token = localStorage.getItem('authToken');
                        const response = await fetch('http://localhost:5000/api/auth/daily-challenge/participate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                blogId: result._id
                            })
                        });

                        if (response.ok) {
                            toast.success('🎉 Successfully participated in today\'s challenge!');
                        } else {
                            const errorData = await response.json();
                            if (errorData.message.includes('already participated')) {
                                toast.error('❌ You have already participated in today\'s challenge. Only one submission per day is allowed.');
                            } else {
                                toast.error(`Challenge participation failed: ${errorData.message}`);
                            }
                        }
                    } catch (challengeError) {
                        console.error('Error participating in challenge:', challengeError);
                        toast.error('Blog created but failed to participate in challenge');
                    }
                } else if (challenge && hasParticipated) {
                    toast.success('Blog created successfully! (Not submitted to challenge - you have already participated today)');
                }
            }
            navigate('/blogs');
        } catch (err) {
            // Error is handled by the slice and shown via toast
        }
    };

    const handleCancel = () => {
        navigate('/blogs');
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
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
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={handleBackToDashboard}
                            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <span className="text-xl">🏠</span>
                            Back to Dashboard
                        </button>
                        <div></div> {/* Spacer for centering */}
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
                    </h1>
                    <p className="text-purple-200">
                        {isEditing ? 'Update your blog post below' : 'Share your thoughts with the world'}
                    </p>
                </div>

                {/* Challenge Banner */}
                {challenge && !isEditing && (
                    <div className={`mb-8 rounded-2xl shadow-lg p-6 text-white text-left ${hasParticipated
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                        }`}>
                        <div className="mb-2">
                            <span className="inline-block bg-white/20 px-3 py-1 rounded-lg text-sm font-semibold mr-2">{challenge.category}</span>
                            {hasParticipated && (
                                <span className="inline-block bg-green-400 text-green-900 px-3 py-1 rounded-lg text-sm font-semibold">
                                    ✅ Already Participated
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold mb-1">Daily Challenge: {challenge.topic}</h2>
                        <p className="text-purple-100">{challenge.description}</p>
                        {hasParticipated && (
                            <div className="mt-4 p-3 bg-white/20 rounded-lg">
                                <p className="text-sm">
                                    <strong>Note:</strong> You have already participated in today's challenge.
                                    You can still create a blog, but it won't be submitted to the challenge.
                                </p>
                            </div>
                        )}
                        {isCheckingParticipation && (
                            <div className="mt-4 flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span className="text-sm">Checking participation status...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Editor Form */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Blog Image URL Input */}
                        <div>
                            <label className="block text-white font-semibold mb-2">
                                Blog Image URL
                            </label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleInputChange}
                                placeholder="Paste image URL here..."
                                className="w-full px-4 py-3 rounded-xl bg-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                disabled={isCreating || isUpdating}
                            />
                            {formData.image && (
                                <div className="mt-4 flex justify-center">
                                    <img
                                        src={formData.image}
                                        alt="Blog Preview"
                                        className="max-h-48 rounded-lg shadow-lg border border-white/20"
                                        onError={e => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}
                        </div>
                        {/* Title Input */}
                        <div>
                            <label htmlFor="title" className="block text-white font-semibold mb-2">
                                Blog Title
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter your blog title..."
                                    className="w-full px-4 py-3 rounded-xl bg-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                    disabled={isCreating || isUpdating || isSuggesting}
                                />
                                <button
                                    type="button"
                                    onClick={handleSuggestTitle}
                                    disabled={isCreating || isUpdating || isSuggesting}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSuggesting ? 'Suggesting...' : 'Suggest Title'}
                                </button>
                            </div>
                        </div>

                        {/* Categories Section */}
                        <div>
                            <label className="block text-white font-semibold mb-2">
                                Categories
                            </label>

                            {/* Current Categories */}
                            {formData.categories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {formData.categories.map((category, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-purple-500/50 text-white rounded-lg flex items-center gap-2"
                                        >
                                            {category}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCategory(category)}
                                                className="text-white hover:text-red-300 transition-colors"
                                                disabled={isCreating || isUpdating}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Add New Category */}
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="Add a new category..."
                                    className="flex-1 px-4 py-2 rounded-xl bg-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                    disabled={isCreating || isUpdating}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCategory();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    disabled={isCreating || isUpdating || !newCategory.trim()}
                                    className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Predefined Categories */}
                            <div>
                                <p className="text-purple-200 text-sm mb-2">Quick add categories:</p>
                                <div className="flex flex-wrap gap-2">
                                    {predefinedCategories.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => handlePredefinedCategoryClick(category)}
                                            disabled={isCreating || isUpdating || formData.categories.includes(category)}
                                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${formData.categories.includes(category)
                                                ? 'bg-purple-500/50 text-white cursor-not-allowed'
                                                : 'bg-white/20 text-white hover:bg-white/30'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
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