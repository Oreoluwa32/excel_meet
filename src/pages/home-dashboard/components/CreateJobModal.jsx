import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import NigerianStateSelect from '../../../components/ui/NigerianStateSelect';
import { MapPin, DollarSign, Calendar, AlertCircle, Briefcase, FileText, Image as ImageIcon, X } from 'lucide-react';

/**
 * CreateJobModal Component
 * Modal for creating a new job posting or finding a professional
 */
const CreateJobModal = ({ isOpen, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    budget_min: '',
    budget_max: '',
    budget_type: 'fixed', // fixed or hourly
    urgency: 'normal',
    state: '',
    city: '',
    address: '',
    start_date: '',
    duration: '',
    duration_unit: 'days', // days, weeks, months
    skills_required: [],
    requirements: ''
  });

  // Service categories
  const categories = [
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Repairs',
    'Consulting',
    'Landscaping',
    'Painting',
    'Moving',
    'Carpentry',
    'HVAC',
    'Security',
    'Catering'
  ];

  // Urgency levels
  const urgencyLevels = [
    { value: 'urgent', label: 'Urgent (Within 24 hours)', color: 'text-red-600' },
    { value: 'high', label: 'High Priority (1-3 days)', color: 'text-orange-600' },
    { value: 'normal', label: 'Normal (Within a week)', color: 'text-blue-600' },
    { value: 'low', label: 'Low Priority (Flexible)', color: 'text-gray-600' }
  ];

  // Popular skills
  const popularSkills = [
    'Licensed Professional',
    'Insured',
    'Background Checked',
    'Emergency Service',
    'Weekend Available',
    'Same Day Service',
    'Free Consultation',
    'Warranty Provided',
    'Eco-Friendly',
    'Senior Discount'
  ];

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle state change
  const handleStateChange = (value) => {
    setFormData(prev => ({
      ...prev,
      state: value,
      city: '' // Reset city when state changes
    }));
    
    if (errors.state) {
      setErrors(prev => ({
        ...prev,
        state: null
      }));
    }
  };

  // Handle skill toggle
  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.includes(skill)
        ? prev.skills_required.filter(s => s !== skill)
        : [...prev.skills_required, skill]
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        alert(`${file.name} is not a valid image file`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      
      return true;
    });

    // Create preview URLs
    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.budget_min || formData.budget_min <= 0) {
      newErrors.budget_min = 'Minimum budget is required';
    }

    if (formData.budget_max && parseFloat(formData.budget_max) < parseFloat(formData.budget_min)) {
      newErrors.budget_max = 'Maximum budget must be greater than minimum';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    } else {
      const selectedDate = new Date(formData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.start_date = 'Start date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare job data
      const jobData = {
        ...formData,
        images: images.map(img => img.file),
        created_at: new Date().toISOString()
      };

      // Call the onSubmit callback
      await onSubmit(jobData);

      // Reset form
      setFormData({
        title: '',
        category: '',
        description: '',
        budget_min: '',
        budget_max: '',
        budget_type: 'fixed',
        urgency: 'normal',
        state: '',
        city: '',
        address: '',
        start_date: '',
        duration: '',
        duration_unit: 'days',
        skills_required: [],
        requirements: ''
      });
      setImages([]);
      setErrors({});

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      // Clean up image previews
      images.forEach(img => URL.revokeObjectURL(img.preview));
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Job Posting"
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Fix leaking kitchen sink"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Service Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the job in detail. What needs to be done? Any specific requirements?"
            rows={5}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-500">
              {formData.description.length} characters (minimum 50)
            </p>
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>
        </div>

        {/* Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="budget_min" className="block text-sm font-medium text-gray-700 mb-1">
              Budget (Min) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                id="budget_min"
                name="budget_min"
                value={formData.budget_min}
                onChange={handleChange}
                placeholder="5000"
                min="0"
                step="100"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.budget_min ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.budget_min && <p className="mt-1 text-sm text-red-500">{errors.budget_min}</p>}
          </div>

          <div>
            <label htmlFor="budget_max" className="block text-sm font-medium text-gray-700 mb-1">
              Budget (Max) <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                id="budget_max"
                name="budget_max"
                value={formData.budget_max}
                onChange={handleChange}
                placeholder="10000"
                min="0"
                step="100"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.budget_max ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.budget_max && <p className="mt-1 text-sm text-red-500">{errors.budget_max}</p>}
          </div>
        </div>

        {/* Budget Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="budget_type"
                value="fixed"
                checked={formData.budget_type === 'fixed'}
                onChange={handleChange}
                className="mr-2"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-700">Fixed Price (₦)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="budget_type"
                value="hourly"
                checked={formData.budget_type === 'hourly'}
                onChange={handleChange}
                className="mr-2"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-700">Hourly Rate (₦/hr)</span>
            </label>
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
            Priority Level <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              {urgencyLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <NigerianStateSelect
              value={formData.state}
              onChange={handleStateChange}
              required={true}
              error={errors.state}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Ikeja"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Specific Address <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address or landmark"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        {/* Start Date and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Start Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.start_date && <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>}
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Duration <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="1"
                min="1"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              <select
                name="duration_unit"
                value={formData.duration_unit}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skills Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Skills/Requirements <span className="text-gray-400">(Optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  formData.skills_required.includes(skill)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={isSubmitting}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Requirements */}
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Requirements <span className="text-gray-400">(Optional)</span>
          </label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="Any other specific requirements or preferences?"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos <span className="text-gray-400">(Optional, max 5)</span>
          </label>
          
          {/* Image Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isSubmitting}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {images.length < 5 && (
            <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <div className="flex items-center gap-2 text-gray-600">
                <ImageIcon size={20} />
                <span className="text-sm">
                  {images.length === 0 ? 'Upload photos' : `Add more (${5 - images.length} remaining)`}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={isSubmitting}
              />
            </label>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: JPG, PNG, GIF. Max size: 5MB per image.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </span>
            ) : (
              'Create Job Posting'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateJobModal;