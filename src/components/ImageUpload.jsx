import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

const ImageUpload = ({ onImageSelect, currentImage = null, disabled = false }) => {
    const [preview, setPreview] = useState(currentImage);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];

        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);

            // Pass file to parent component
            onImageSelect(file);

            toast.success('Image uploaded successfully!');
        }
    }, [onImageSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxFiles: 1,
        disabled
    });

    const handleRemoveImage = () => {
        setPreview(null);
        onImageSelect(null);
        toast.success('Image removed');
    };

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${isDragActive
                    ? 'border-indigo-400 bg-indigo-50/20'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50/10'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input {...getInputProps()} />

                {preview ? (
                    <div className="space-y-4">
                        <div className="relative inline-block">
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-h-48 rounded-lg shadow-lg"
                            />
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveImage();
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-gray-600">
                            Click or drag to replace image
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-4xl">📷</div>
                        <div>
                            <p className="text-lg font-medium text-gray-700">
                                {isDragActive ? 'Drop the image here' : 'Upload Blog Image'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Drag & drop an image here, or click to select
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                Supports: JPG, PNG, GIF, WebP (max 5MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Progress or Status */}
            {disabled && (
                <div className="text-center text-sm text-gray-500">
                    Uploading image...
                </div>
            )}
        </div>
    );
};

export default ImageUpload; 