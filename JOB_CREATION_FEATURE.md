# Job Creation Feature Documentation

## Overview
The Job Creation feature allows users to post job openings or find professionals directly from the home dashboard using the floating action button (Plus button). This feature provides a comprehensive form for users to specify all job details, requirements, and preferences.

## Access Point
- **Location**: Home Dashboard (`/home-dashboard`)
- **Trigger**: Floating Action Button (Blue Plus button in bottom-right corner)
- **Authentication**: Required (redirects to login if not authenticated)

## Feature Components

### 1. CreateJobModal Component
**Location**: `src/pages/home-dashboard/components/CreateJobModal.jsx`

A comprehensive modal form that collects all necessary information for creating a job posting.

#### Form Fields

##### Required Fields
1. **Job Title**
   - Type: Text input
   - Validation: Required, non-empty
   - Example: "Fix leaking kitchen sink"
   - Purpose: Brief, descriptive title of the job

2. **Service Category**
   - Type: Dropdown select
   - Options: Plumbing, Electrical, Cleaning, Repairs, Consulting, Landscaping, Painting, Moving, Carpentry, HVAC, Security, Catering
   - Validation: Required
   - Purpose: Categorize the job for better matching with professionals

3. **Job Description**
   - Type: Textarea (5 rows)
   - Validation: Required, minimum 50 characters
   - Character counter displayed
   - Purpose: Detailed explanation of what needs to be done

4. **Budget (Minimum)**
   - Type: Number input
   - Currency: Nigerian Naira (₦)
   - Validation: Required, must be greater than 0
   - Step: 100
   - Purpose: Minimum budget for the job

5. **State**
   - Type: Nigerian State Select (custom component)
   - Options: All 36 Nigerian states + FCT
   - Validation: Required
   - Purpose: Job location (state level)

6. **City**
   - Type: Text input
   - Validation: Required
   - Example: "Ikeja"
   - Purpose: Specific city within the selected state

7. **Preferred Start Date**
   - Type: Date picker
   - Validation: Required, cannot be in the past
   - Purpose: When the user wants the job to begin

##### Optional Fields

1. **Budget (Maximum)**
   - Type: Number input
   - Validation: Must be greater than minimum budget if provided
   - Purpose: Maximum budget range

2. **Budget Type**
   - Type: Radio buttons
   - Options: 
     - Fixed Price (₦)
     - Hourly Rate (₦/hr)
   - Default: Fixed Price
   - Purpose: Specify payment structure

3. **Priority Level**
   - Type: Dropdown select
   - Options:
     - Urgent (Within 24 hours) - Red
     - High Priority (1-3 days) - Orange
     - Normal (Within a week) - Blue (Default)
     - Low Priority (Flexible) - Gray
   - Purpose: Indicate job urgency

4. **Specific Address**
   - Type: Text input
   - Purpose: Street address or landmark for more precise location

5. **Estimated Duration**
   - Type: Number input + Unit select
   - Units: Days, Weeks, Months
   - Purpose: Expected time to complete the job

6. **Preferred Skills/Requirements**
   - Type: Multi-select chips
   - Options:
     - Licensed Professional
     - Insured
     - Background Checked
     - Emergency Service
     - Weekend Available
     - Same Day Service
     - Free Consultation
     - Warranty Provided
     - Eco-Friendly
     - Senior Discount
   - Purpose: Specify desired professional qualifications

7. **Additional Requirements**
   - Type: Textarea (3 rows)
   - Purpose: Any other specific requirements or preferences

8. **Photos**
   - Type: File upload (multiple)
   - Formats: JPG, PNG, GIF
   - Max size: 5MB per image
   - Max count: 5 images
   - Features:
     - Image preview
     - Remove individual images
     - Drag and drop support
   - Purpose: Visual reference for the job

## User Flow

### 1. Opening the Modal
```
User clicks Plus button → 
  If authenticated → Modal opens
  If not authenticated → Redirect to login
```

### 2. Filling the Form
1. User enters job title
2. Selects service category
3. Writes detailed description (minimum 50 characters)
4. Sets budget range (min required, max optional)
5. Chooses budget type (fixed or hourly)
6. Selects priority level
7. Chooses state and enters city
8. Optionally adds specific address
9. Selects preferred start date
10. Optionally sets estimated duration
11. Optionally selects preferred skills
12. Optionally adds additional requirements
13. Optionally uploads photos (up to 5)

### 3. Form Validation
- Real-time validation as user types
- Error messages displayed below each field
- Submit button disabled during submission
- Scroll to first error if validation fails

### 4. Submission
```
User clicks "Create Job Posting" →
  Form validates →
    If valid:
      - Show loading state
      - Upload images to Supabase Storage (TODO)
      - Insert job record to database
      - Show success message
      - Close modal
      - Refresh job feed
    If invalid:
      - Show error messages
      - Scroll to first error
      - Keep modal open
```

## Technical Implementation

### Database Schema
The job is inserted into the `jobs` table with the following structure:

```javascript
{
  user_id: string,              // UUID of the user creating the job
  title: string,                // Job title
  category: string,             // Service category
  description: string,          // Detailed description
  budget_min: number,           // Minimum budget
  budget_max: number | null,    // Maximum budget (optional)
  budget_type: string,          // 'fixed' or 'hourly'
  urgency: string,              // 'urgent', 'high', 'normal', or 'low'
  state: string,                // Nigerian state
  city: string,                 // City name
  address: string | null,       // Specific address (optional)
  start_date: string,           // ISO date string
  duration: number | null,      // Duration value (optional)
  duration_unit: string,        // 'days', 'weeks', or 'months'
  skills_required: array,       // Array of skill strings
  requirements: string | null,  // Additional requirements (optional)
  status: string,               // 'open' (default)
  images: array | null,         // Array of image URLs (TODO)
  created_at: string            // ISO timestamp
}
```

### State Management
- Modal open/close state managed in parent component (HomeDashboard)
- Form data managed locally in CreateJobModal component
- Validation errors stored in local state
- Image previews managed with URL.createObjectURL

### API Integration
- Uses Supabase client for database operations
- Insert operation: `supabase.from('jobs').insert([jobRecord])`
- Image upload: TODO - needs Supabase Storage integration

### Error Handling
- Try-catch blocks for async operations
- User-friendly error messages
- Console logging for debugging
- Alert for submission errors

## Validation Rules

### Field-Specific Validation
1. **Title**: Must not be empty
2. **Category**: Must be selected
3. **Description**: 
   - Must not be empty
   - Minimum 50 characters
4. **Budget Min**: 
   - Must be provided
   - Must be greater than 0
5. **Budget Max**: 
   - Must be greater than budget_min if provided
6. **State**: Must be selected
7. **City**: Must not be empty
8. **Start Date**: 
   - Must be provided
   - Cannot be in the past
9. **Images**:
   - Must be image files (image/*)
   - Maximum 5MB per file
   - Maximum 5 files total

### Form-Level Validation
- All required fields must be filled
- All field-specific validations must pass
- Form scrolls to first error on validation failure

## User Experience Features

### Loading States
- Submit button shows spinner during submission
- Button text changes to "Creating..."
- All form inputs disabled during submission
- Modal cannot be closed during submission

### Visual Feedback
- Error messages in red below fields
- Character counter for description
- Image previews with remove buttons
- Selected skills highlighted in blue
- Priority levels color-coded

### Accessibility
- Proper label associations
- Required field indicators (*)
- Keyboard navigation support
- Focus management
- ARIA labels (inherited from Modal component)

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Scrollable modal content
- Touch-friendly buttons and inputs

## Integration Points

### With Home Dashboard
- Triggered by FloatingActionButton
- Refreshes job feed after successful creation
- Checks authentication status

### With Auth Context
- Uses `user` object for user_id
- Checks authentication before opening modal

### With Supabase
- Database: Insert job records
- Storage: Upload job images (TODO)
- Real-time: Potential for live updates

### With Nigerian Components
- NigerianStateSelect for state selection
- Consistent with app's Nigerian focus

## Future Enhancements

### Planned Features
1. **Image Upload to Supabase Storage**
   - Currently images are collected but not uploaded
   - Need to implement upload function
   - Store URLs in database

2. **Draft Saving**
   - Auto-save form data to localStorage
   - Restore draft on modal reopen
   - Clear draft after successful submission

3. **Location Auto-Complete**
   - Google Places API integration
   - Auto-fill city based on state
   - Suggest addresses

4. **Budget Suggestions**
   - Show average budget for category
   - Historical data analysis
   - Market rate indicators

5. **Professional Matching**
   - Show number of matching professionals
   - Preview top matches
   - Instant notifications to professionals

6. **Job Templates**
   - Save frequently posted jobs as templates
   - Quick-fill from templates
   - Template management

7. **Scheduling**
   - Calendar view for start date
   - Recurring jobs support
   - Availability checking

8. **Rich Text Editor**
   - Formatting options for description
   - Bullet points and lists
   - Bold, italic, underline

9. **Video Upload**
   - Support video attachments
   - Video preview
   - Size and format validation

10. **AI-Powered Suggestions**
    - Auto-suggest job title
    - Improve description
    - Recommend budget range
    - Suggest skills required

### Improvements
1. **Better Image Handling**
   - Image compression before upload
   - Crop and resize tools
   - Multiple image formats support

2. **Enhanced Validation**
   - Real-time budget validation
   - Smart date suggestions
   - Duplicate job detection

3. **Better Success Feedback**
   - Success modal instead of alert
   - Show job preview
   - Share job link
   - Edit immediately after creation

4. **Performance Optimization**
   - Lazy load modal content
   - Optimize image previews
   - Debounce validation

5. **Analytics**
   - Track form completion rate
   - Identify drop-off points
   - A/B test form variations

## Testing Recommendations

### Unit Tests
- Form validation logic
- State management
- Error handling
- Image upload validation

### Integration Tests
- Modal open/close
- Form submission flow
- Database insertion
- Error scenarios

### E2E Tests
- Complete job creation flow
- Authentication checks
- Image upload
- Success/error states

### Manual Testing Checklist
- [ ] Modal opens on button click
- [ ] All required fields show errors when empty
- [ ] Description character counter works
- [ ] Budget validation works correctly
- [ ] Date picker prevents past dates
- [ ] State selection populates correctly
- [ ] Skills can be selected/deselected
- [ ] Images can be uploaded and removed
- [ ] Form submits successfully
- [ ] Success message appears
- [ ] Modal closes after submission
- [ ] Job appears in feed
- [ ] Error handling works
- [ ] Loading states display correctly
- [ ] Responsive on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

## Troubleshooting

### Common Issues

1. **Modal doesn't open**
   - Check authentication status
   - Verify state management
   - Check console for errors

2. **Form won't submit**
   - Check validation errors
   - Verify all required fields
   - Check network connection
   - Review console logs

3. **Images not uploading**
   - Verify file size (max 5MB)
   - Check file format (image/*)
   - Ensure max 5 images
   - Check browser compatibility

4. **Database insertion fails**
   - Verify Supabase connection
   - Check table schema
   - Review RLS policies
   - Check user permissions

5. **State selection not working**
   - Verify NigerianStateSelect component
   - Check Supabase RPC function
   - Review fallback data

### Debug Mode
Enable detailed logging by adding to console:
```javascript
localStorage.setItem('debug', 'true');
```

## Security Considerations

### Input Sanitization
- All user inputs should be sanitized
- Prevent XSS attacks
- Validate on both client and server

### Authentication
- Verify user is authenticated
- Check user permissions
- Validate user_id

### File Upload Security
- Validate file types
- Check file sizes
- Scan for malware
- Use secure storage

### Database Security
- Use Row Level Security (RLS)
- Validate all inputs
- Prevent SQL injection
- Audit trail for job creation

## Performance Metrics

### Target Metrics
- Modal open time: < 100ms
- Form validation: < 50ms per field
- Image preview: < 200ms per image
- Form submission: < 2 seconds
- Database insertion: < 1 second

### Monitoring
- Track submission success rate
- Monitor error rates
- Measure completion time
- Analyze drop-off points

## Support

### For Users
- In-app help text
- Tooltips on complex fields
- Example values provided
- Contact support for issues

### For Developers
- Code comments in component
- This documentation
- Component README
- API documentation

## Changelog

### Version 1.0.0 (Current)
- Initial implementation
- Complete form with all fields
- Image upload UI (storage TODO)
- Form validation
- Database integration
- Success/error handling
- Responsive design
- Accessibility features

### Upcoming (Version 1.1.0)
- Image upload to Supabase Storage
- Draft saving
- Better success feedback
- Professional matching preview