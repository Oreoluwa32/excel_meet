import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Loader2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';

const AvatarUploadModal = ({ isOpen, onClose, currentAvatar }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentAvatar);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { updateProfile } = useAuth();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setError(null);
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // In a real implementation, you would upload to Supabase Storage
      // For now, we'll simulate the upload
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update profile with new avatar URL
      // In production, this would be the actual uploaded file URL
      const result = await updateProfile({
        avatar_url: previewUrl
      });

      if (result?.success) {
        onClose();
      } else {
        setError(result?.error || 'Failed to update avatar');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    setError(null);

    try {
      const result = await updateProfile({
        avatar_url: null
      });

      if (result?.success) {
        onClose();
      } else {
        setError(result?.error || 'Failed to remove avatar');
      }
    } catch (err) {
      console.error('Error removing avatar:', err);
      setError('Failed to remove avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Update Profile Picture
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
              >
                <Camera size={16} />
              </button>
            </div>
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Upload size={20} className="text-gray-400" />
            <span className="text-gray-600">
              {selectedFile ? selectedFile.name : 'Choose a photo'}
            </span>
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Recommended size: 400x400 pixels</p>
            <p>• Maximum file size: 5MB</p>
            <p>• Supported formats: JPG, PNG, GIF</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="ghost"
            onClick={handleRemoveAvatar}
            disabled={uploading}
            className="text-red-600 hover:text-red-700"
          >
            Remove Photo
          </Button>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarUploadModal;