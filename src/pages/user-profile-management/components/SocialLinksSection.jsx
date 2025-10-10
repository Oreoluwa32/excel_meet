import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../utils/supabase';

/**
 * Social Links and Resume Section Component
 * Allows users to manage their social media links and upload/manage their resume
 */
const SocialLinksSection = () => {
  const { user, userProfile, updateProfile } = useAuth();
  
  // Form state for social links
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    instagram: '',
    facebook: '',
    x: '',
    website: ''
  });
  
  // Resume state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Load user profile data
  useEffect(() => {
    if (userProfile) {
      // Load social links from JSONB field
      const links = userProfile.social_links || {};
      setSocialLinks({
        linkedin: links.linkedin || '',
        instagram: links.instagram || '',
        facebook: links.facebook || '',
        x: links.x || '',
        website: links.website || ''
      });
      
      // Load resume URL
      setResumeUrl(userProfile.resume_url || '');
      if (userProfile.resume_url) {
        // Extract filename from URL
        const urlParts = userProfile.resume_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        setResumeFileName(decodeURIComponent(fileName));
      }
    }
  }, [userProfile]);
  
  // Handle social link input changes
  const handleSocialLinkChange = (platform, value) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };
  
  // Handle resume file selection
  const handleResumeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setResumeFile(file);
      setError(null);
    }
  };
  
  // Handle resume upload
  const handleResumeUpload = async () => {
    if (!resumeFile || !user) return;
    
    setUploadingResume(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Delete old resume if exists
      if (resumeUrl) {
        const oldPath = resumeUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('resumes').remove([oldPath]);
      }
      
      // Upload new resume
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resumeFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);
      
      // Update user profile with resume URL
      const result = await updateProfile({
        resume_url: publicUrl
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }
      
      setResumeUrl(publicUrl);
      setResumeFileName(resumeFile.name);
      setResumeFile(null);
      setSuccess('Resume uploaded successfully');
      
      // Clear file input
      const fileInput = document.getElementById('resume-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error uploading resume:', error);
      setError(error.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };
  
  // Handle resume deletion
  const handleResumeDelete = async () => {
    if (!resumeUrl || !user) return;
    
    if (!confirm('Are you sure you want to delete your resume?')) {
      return;
    }
    
    setUploadingResume(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Delete from storage
      const filePath = resumeUrl.split('/').slice(-2).join('/');
      const { error: deleteError } = await supabase.storage
        .from('resumes')
        .remove([filePath]);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Update user profile
      const result = await updateProfile({
        resume_url: null
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }
      
      setResumeUrl('');
      setResumeFileName('');
      setSuccess('Resume deleted successfully');
      
    } catch (error) {
      console.error('Error deleting resume:', error);
      setError(error.message || 'Failed to delete resume');
    } finally {
      setUploadingResume(false);
    }
  };
  
  // Handle form submission for social links
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update user profile with social links
      const result = await updateProfile({
        social_links: socialLinks
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }
      
      setSuccess('Social links updated successfully');
    } catch (error) {
      console.error('Error updating social links:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Social Links & Resume</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Add your social media profiles and upload your resume
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {/* Social Links Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Social Media Links</h4>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* LinkedIn */}
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    LinkedIn
                  </div>
                </label>
                <input
                  type="url"
                  id="linkedin"
                  value={socialLinks.linkedin}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* Instagram */}
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </div>
                </label>
                <input
                  type="url"
                  id="instagram"
                  value={socialLinks.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/yourprofile"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* Facebook */}
              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </div>
                </label>
                <input
                  type="url"
                  id="facebook"
                  value={socialLinks.facebook}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourprofile"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* X (Twitter) */}
              <div>
                <label htmlFor="x" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X (Twitter)
                  </div>
                </label>
                <input
                  type="url"
                  id="x"
                  value={socialLinks.x}
                  onChange={(e) => handleSocialLinkChange('x', e.target.value)}
                  placeholder="https://x.com/yourprofile"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* Website */}
              <div className="sm:col-span-2">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Website
                  </div>
                </label>
                <input
                  type="url"
                  id="website"
                  value={socialLinks.website}
                  onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{success}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Social Links'}
            </button>
          </div>
        </form>
        
        {/* Resume Upload Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h4 className="text-base font-medium text-gray-900 mb-4">Resume / CV</h4>
          
          {resumeUrl ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{resumeFileName || 'Resume.pdf'}</p>
                    <p className="text-xs text-gray-500">Uploaded</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </a>
                  <button
                    onClick={handleResumeDelete}
                    disabled={uploadingResume}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 px-4 border-2 border-dashed border-gray-300 rounded-lg mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">No resume uploaded</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="resume-upload" className="block text-sm font-medium text-gray-700 mb-2">
                {resumeUrl ? 'Upload New Resume' : 'Upload Resume'}
              </label>
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-xs text-gray-500">
                Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
              </p>
            </div>
            
            {resumeFile && (
              <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  </svg>
                  <span className="text-sm text-gray-700">{resumeFile.name}</span>
                </div>
                <button
                  onClick={handleResumeUpload}
                  disabled={uploadingResume}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingResume ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLinksSection;