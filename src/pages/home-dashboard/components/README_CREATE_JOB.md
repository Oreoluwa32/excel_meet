# CreateJobModal Component - Developer Guide

## Overview
The `CreateJobModal` component is a comprehensive form modal for creating job postings in the Excel Meet application. It provides a user-friendly interface for collecting all necessary job information with built-in validation and error handling.

## Component Location
```
src/pages/home-dashboard/components/CreateJobModal.jsx
```

## Dependencies
```javascript
import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import NigerianStateSelect from '../../../components/ui/NigerianStateSelect';
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  Briefcase, 
  FileText, 
  Image as ImageIcon, 
  X 
} from 'lucide-react';
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls modal visibility |
| `onClose` | function | Yes | Callback when modal should close |
| `onSubmit` | function | Yes | Callback when form is submitted with job data |

### Prop Details

#### `isOpen`
- **Type**: `boolean`
- **Purpose**: Controls whether the modal is visible
- **Usage**: Managed by parent component state

#### `onClose`
- **Type**: `() => void`
- **Purpose**: Called when user wants to close the modal
- **Triggers**: 
  - Close button click
  - Overlay click (if enabled)
  - Escape key press (if enabled)
  - Cancel button click

#### `onSubmit`
- **Type**: `(jobData: JobData) => Promise<void>`
- **Purpose**: Called when form is successfully validated and submitted
- **Parameters**: Job data object (see JobData interface below)
- **Expected behavior**: 
  - Should handle async operations
  - Should throw error if submission fails
  - Component will handle loading states and modal closing

## Data Structures

### JobData Interface
```typescript
interface JobData {
  title: string;                    // Job title
  category: string;                 // Service category
  description: string;              // Detailed description
  budget_min: string;               // Minimum budget (as string for input)
  budget_max: string;               // Maximum budget (optional)
  budget_type: 'fixed' | 'hourly';  // Budget type
  urgency: 'urgent' | 'high' | 'normal' | 'low'; // Priority level
  state: string;                    // Nigerian state
  city: string;                     // City name
  address: string;                  // Specific address (optional)
  start_date: string;               // ISO date string
  duration: string;                 // Duration value (optional)
  duration_unit: 'days' | 'weeks' | 'months'; // Duration unit
  skills_required: string[];        // Array of selected skills
  requirements: string;             // Additional requirements (optional)
  images: File[];                   // Array of image files
  created_at: string;               // ISO timestamp
}
```

### FormErrors Interface
```typescript
interface FormErrors {
  [key: string]: string | null;
}
```

## Usage Example

### Basic Usage
```jsx
import { useState } from 'react';
import CreateJobModal from './components/CreateJobModal';
import { supabase } from '../../utils/supabase';

function HomeDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateJob = async (jobData) => {
    // Process job data
    const jobRecord = {
      user_id: user.id,
      title: jobData.title,
      category: jobData.category,
      // ... other fields
    };

    // Insert to database
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobRecord])
      .select()
      .single();

    if (error) throw error;

    // Show success message
    alert('Job created successfully!');
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Create Job
      </button>

      <CreateJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateJob}
      />
    </>
  );
}
```

### With Error Handling
```jsx
const handleCreateJob = async (jobData) => {
  try {
    // Upload images first
    const imageUrls = await uploadImages(jobData.images);

    // Create job record
    const jobRecord = {
      ...jobData,
      images: imageUrls,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('jobs')
      .insert([jobRecord])
      .select()
      .single();

    if (error) throw error;

    // Success handling
    showSuccessToast('Job posted successfully!');
    refreshJobFeed();
  } catch (error) {
    console.error('Error creating job:', error);
    showErrorToast('Failed to create job. Please try again.');
    throw error; // Re-throw to let modal handle it
  }
};
```

## Internal State

### Form Data State
```javascript
const [formData, setFormData] = useState({
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
```

### Other State
```javascript
const [isSubmitting, setIsSubmitting] = useState(false);
const [errors, setErrors] = useState({});
const [images, setImages] = useState([]);
```

## Validation Rules

### Field Validation
The component implements comprehensive validation:

```javascript
const validateForm = () => {
  const newErrors = {};

  // Title validation
  if (!formData.title.trim()) {
    newErrors.title = 'Job title is required';
  }

  // Category validation
  if (!formData.category) {
    newErrors.category = 'Please select a category';
  }

  // Description validation
  if (!formData.description.trim()) {
    newErrors.description = 'Job description is required';
  } else if (formData.description.trim().length < 50) {
    newErrors.description = 'Description must be at least 50 characters';
  }

  // Budget validation
  if (!formData.budget_min || formData.budget_min <= 0) {
    newErrors.budget_min = 'Minimum budget is required';
  }

  if (formData.budget_max && 
      parseFloat(formData.budget_max) < parseFloat(formData.budget_min)) {
    newErrors.budget_max = 'Maximum budget must be greater than minimum';
  }

  // Location validation
  if (!formData.state) {
    newErrors.state = 'State is required';
  }

  if (!formData.city.trim()) {
    newErrors.city = 'City is required';
  }

  // Date validation
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
```

### Image Validation
```javascript
const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  
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
```

## Event Handlers

### Input Change Handler
```javascript
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
```

### State Change Handler
```javascript
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
```

### Skill Toggle Handler
```javascript
const handleSkillToggle = (skill) => {
  setFormData(prev => ({
    ...prev,
    skills_required: prev.skills_required.includes(skill)
      ? prev.skills_required.filter(s => s !== skill)
      : [...prev.skills_required, skill]
  }));
};
```

### Form Submit Handler
```javascript
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
    const jobData = {
      ...formData,
      images: images.map(img => img.file),
      created_at: new Date().toISOString()
    };

    await onSubmit(jobData);

    // Reset form
    setFormData({ /* initial state */ });
    setImages([]);
    setErrors({});

    onClose();
  } catch (error) {
    console.error('Error creating job:', error);
    alert('Failed to create job. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

## Styling

### Tailwind Classes Used
The component uses Tailwind CSS for styling:

- **Layout**: `space-y-6`, `grid`, `grid-cols-1`, `md:grid-cols-2`, `gap-4`
- **Forms**: `w-full`, `px-4`, `py-2`, `border`, `rounded-lg`
- **Colors**: `text-gray-700`, `bg-blue-600`, `border-red-500`
- **States**: `hover:bg-blue-700`, `focus:ring-2`, `disabled:opacity-50`
- **Responsive**: `md:grid-cols-2`, `sm:text-sm`

### Custom Styling
```css
/* Error state */
.border-red-500 { border-color: #ef4444; }

/* Loading state */
.animate-spin { animation: spin 1s linear infinite; }

/* Disabled state */
.disabled\:opacity-50:disabled { opacity: 0.5; }
```

## Accessibility

### ARIA Labels
- Form inputs have associated labels
- Required fields marked with asterisk
- Error messages linked to inputs

### Keyboard Navigation
- Tab order follows logical flow
- Enter submits form
- Escape closes modal (inherited from Modal)

### Screen Reader Support
- Semantic HTML elements
- Descriptive labels
- Error announcements

## Performance Considerations

### Image Preview Optimization
```javascript
// Clean up image previews on unmount
useEffect(() => {
  return () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
  };
}, [images]);
```

### Debouncing (Future Enhancement)
```javascript
// Debounce validation for better performance
const debouncedValidate = useMemo(
  () => debounce(validateForm, 300),
  [formData]
);
```

## Testing

### Unit Tests
```javascript
describe('CreateJobModal', () => {
  it('renders when isOpen is true', () => {
    render(<CreateJobModal isOpen={true} onClose={jest.fn()} onSubmit={jest.fn()} />);
    expect(screen.getByText('Create Job Posting')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const onSubmit = jest.fn();
    render(<CreateJobModal isOpen={true} onClose={jest.fn()} onSubmit={onSubmit} />);
    
    fireEvent.click(screen.getByText('Create Job Posting'));
    
    expect(screen.getByText('Job title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<CreateJobModal isOpen={true} onClose={jest.fn()} onSubmit={onSubmit} />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/job title/i), {
      target: { value: 'Test Job' }
    });
    // ... fill other fields
    
    fireEvent.click(screen.getByText('Create Job Posting'));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Job'
      }));
    });
  });
});
```

### Integration Tests
```javascript
describe('CreateJobModal Integration', () => {
  it('creates job in database', async () => {
    const { user } = renderWithAuth(<HomeDashboard />);
    
    fireEvent.click(screen.getByRole('button', { name: /create job/i }));
    
    // Fill and submit form
    // ...
    
    await waitFor(() => {
      expect(screen.getByText('Job posted successfully!')).toBeInTheDocument();
    });
    
    // Verify database
    const { data } = await supabase.from('jobs').select('*').eq('title', 'Test Job');
    expect(data).toHaveLength(1);
  });
});
```

## Common Issues and Solutions

### Issue: Modal doesn't close after submission
**Solution**: Ensure `onClose()` is called after successful submission

### Issue: Images not displaying
**Solution**: Check that `URL.createObjectURL()` is called and previews are cleaned up

### Issue: Validation errors persist
**Solution**: Clear errors when field values change

### Issue: Form resets unexpectedly
**Solution**: Don't reset form state on every render

## Future Enhancements

### Planned Features
1. **Auto-save to localStorage**
   ```javascript
   useEffect(() => {
     localStorage.setItem('jobDraft', JSON.stringify(formData));
   }, [formData]);
   ```

2. **Rich text editor for description**
   ```javascript
   import RichTextEditor from 'react-quill';
   ```

3. **Location autocomplete**
   ```javascript
   import PlacesAutocomplete from 'react-places-autocomplete';
   ```

4. **Budget suggestions**
   ```javascript
   const suggestedBudget = await fetchAverageBudget(category);
   ```

## Contributing

### Code Style
- Use functional components with hooks
- Follow existing naming conventions
- Add comments for complex logic
- Keep functions small and focused

### Pull Request Checklist
- [ ] Code follows style guide
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console errors
- [ ] Accessibility tested
- [ ] Mobile responsive

## Support

For questions or issues:
- Check this documentation
- Review component code comments
- Contact development team
- Create GitHub issue

## License
Part of the Excel Meet application. All rights reserved.