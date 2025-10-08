# Job Creation Feature - Testing Checklist

## Pre-Testing Setup

### Environment Check
- [ ] Development server is running
- [ ] Database connection is active
- [ ] Supabase credentials are configured
- [ ] User is logged in (for authenticated tests)
- [ ] Browser console is open for debugging

### Database Verification
- [ ] `jobs` table exists in Supabase
- [ ] Table schema matches expected structure
- [ ] RLS policies are configured
- [ ] User has insert permissions

---

## Functional Testing

### 1. Modal Opening/Closing

#### Opening the Modal
- [ ] Plus button is visible on home dashboard
- [ ] Plus button is in bottom-right corner
- [ ] Plus button has blue background
- [ ] Clicking Plus button opens modal (when logged in)
- [ ] Clicking Plus button redirects to login (when not logged in)
- [ ] Modal appears with smooth animation
- [ ] Modal title reads "Create Job Posting"
- [ ] Modal has close button (X) in top-right

#### Closing the Modal
- [ ] Clicking X button closes modal
- [ ] Clicking overlay (outside modal) closes modal
- [ ] Pressing Escape key closes modal
- [ ] Clicking Cancel button closes modal
- [ ] Modal cannot be closed during submission
- [ ] Modal closes automatically after successful submission

### 2. Form Fields - Required

#### Job Title
- [ ] Field is visible and labeled correctly
- [ ] Has asterisk (*) indicating required
- [ ] Placeholder text is helpful
- [ ] Accepts text input
- [ ] Shows error when empty on submit
- [ ] Error clears when user types
- [ ] Error message: "Job title is required"

#### Service Category
- [ ] Dropdown is visible and labeled
- [ ] Has asterisk (*) indicating required
- [ ] Shows "Select a category" placeholder
- [ ] Lists all 12 categories:
  - [ ] Plumbing
  - [ ] Electrical
  - [ ] Cleaning
  - [ ] Repairs
  - [ ] Consulting
  - [ ] Landscaping
  - [ ] Painting
  - [ ] Moving
  - [ ] Carpentry
  - [ ] HVAC
  - [ ] Security
  - [ ] Catering
- [ ] Shows error when not selected on submit
- [ ] Error message: "Please select a category"
- [ ] Has briefcase icon

#### Job Description
- [ ] Textarea is visible and labeled
- [ ] Has asterisk (*) indicating required
- [ ] Placeholder text is helpful
- [ ] Accepts multi-line text
- [ ] Shows character counter
- [ ] Counter updates as user types
- [ ] Shows "0 characters (minimum 50)"
- [ ] Shows error when empty on submit
- [ ] Shows error when less than 50 characters
- [ ] Error message: "Job description is required" (if empty)
- [ ] Error message: "Description must be at least 50 characters" (if too short)

#### Budget (Minimum)
- [ ] Field is visible and labeled
- [ ] Has asterisk (*) indicating required
- [ ] Has dollar sign (₦) icon
- [ ] Accepts numeric input only
- [ ] Shows error when empty on submit
- [ ] Shows error when 0 or negative
- [ ] Error message: "Minimum budget is required"
- [ ] Allows decimal values
- [ ] Step is 100

#### State
- [ ] NigerianStateSelect component renders
- [ ] Has asterisk (*) indicating required
- [ ] Shows "Select State" placeholder
- [ ] Lists all Nigerian states
- [ ] States are alphabetically sorted
- [ ] Shows error when not selected on submit
- [ ] Error message: "State is required"
- [ ] Resets city when state changes

#### City
- [ ] Field is visible and labeled
- [ ] Has asterisk (*) indicating required
- [ ] Has map pin icon
- [ ] Accepts text input
- [ ] Shows error when empty on submit
- [ ] Error message: "City is required"

#### Preferred Start Date
- [ ] Date picker is visible and labeled
- [ ] Has asterisk (*) indicating required
- [ ] Has calendar icon
- [ ] Opens date picker on click
- [ ] Shows error when not selected on submit
- [ ] Prevents selection of past dates
- [ ] Error message: "Start date is required" (if empty)
- [ ] Error message: "Start date cannot be in the past" (if past date)

### 3. Form Fields - Optional

#### Budget (Maximum)
- [ ] Field is visible and labeled
- [ ] Shows "(Optional)" indicator
- [ ] Has dollar sign (₦) icon
- [ ] Accepts numeric input only
- [ ] No error when empty
- [ ] Shows error if less than minimum budget
- [ ] Error message: "Maximum budget must be greater than minimum"

#### Budget Type
- [ ] Radio buttons are visible
- [ ] Two options: "Fixed Price (₦)" and "Hourly Rate (₦/hr)"
- [ ] "Fixed Price" is selected by default
- [ ] Can switch between options
- [ ] Only one can be selected at a time

#### Priority Level
- [ ] Dropdown is visible and labeled
- [ ] Has alert circle icon
- [ ] Shows 4 urgency levels:
  - [ ] Urgent (Within 24 hours)
  - [ ] High Priority (1-3 days)
  - [ ] Normal (Within a week) - Default
  - [ ] Low Priority (Flexible)
- [ ] "Normal" is selected by default
- [ ] Can change selection

#### Specific Address
- [ ] Field is visible and labeled
- [ ] Shows "(Optional)" indicator
- [ ] Accepts text input
- [ ] No error when empty
- [ ] Placeholder text is helpful

#### Estimated Duration
- [ ] Number input is visible
- [ ] Unit selector is visible (Days, Weeks, Months)
- [ ] "Days" is selected by default
- [ ] Accepts numeric input
- [ ] Can change unit
- [ ] No error when empty

#### Preferred Skills/Requirements
- [ ] Skill chips are visible
- [ ] Shows all 10 skill options:
  - [ ] Licensed Professional
  - [ ] Insured
  - [ ] Background Checked
  - [ ] Emergency Service
  - [ ] Weekend Available
  - [ ] Same Day Service
  - [ ] Free Consultation
  - [ ] Warranty Provided
  - [ ] Eco-Friendly
  - [ ] Senior Discount
- [ ] Can click to select/deselect
- [ ] Selected skills turn blue
- [ ] Unselected skills are gray
- [ ] Multiple skills can be selected
- [ ] No error when none selected

#### Additional Requirements
- [ ] Textarea is visible and labeled
- [ ] Shows "(Optional)" indicator
- [ ] Accepts multi-line text
- [ ] No error when empty

#### Photos
- [ ] Upload section is visible
- [ ] Shows "(Optional, max 5)" indicator
- [ ] Has upload button with camera icon
- [ ] Clicking opens file picker
- [ ] File picker filters to images only
- [ ] Can select multiple files at once
- [ ] Shows preview after upload
- [ ] Preview shows thumbnail
- [ ] Each preview has remove button (X)
- [ ] Remove button appears on hover
- [ ] Clicking remove deletes preview
- [ ] Can upload up to 5 images
- [ ] Upload button disappears after 5 images
- [ ] Shows remaining count (e.g., "Add more (3 remaining)")
- [ ] Validates file type (image/*)
- [ ] Validates file size (5MB max)
- [ ] Shows alert for invalid file type
- [ ] Shows alert for oversized file
- [ ] Supported formats note is visible

### 4. Form Validation

#### Client-Side Validation
- [ ] Validation runs on form submit
- [ ] All required fields are checked
- [ ] Error messages appear below fields
- [ ] Error messages are in red
- [ ] Fields with errors have red border
- [ ] Page scrolls to first error
- [ ] Smooth scroll animation
- [ ] Form doesn't submit if invalid
- [ ] Errors clear when user corrects field

#### Field-Specific Validation
- [ ] Title: Not empty
- [ ] Category: Selected
- [ ] Description: Not empty, min 50 chars
- [ ] Budget Min: Provided, > 0
- [ ] Budget Max: > Budget Min (if provided)
- [ ] State: Selected
- [ ] City: Not empty
- [ ] Start Date: Provided, not in past

#### Image Validation
- [ ] Only image files accepted
- [ ] Files over 5MB rejected
- [ ] Alert shown for invalid files
- [ ] Valid files added to preview
- [ ] Maximum 5 images enforced

### 5. Form Submission

#### Before Submission
- [ ] All required fields filled
- [ ] No validation errors
- [ ] Submit button is enabled
- [ ] Submit button text: "Create Job Posting"

#### During Submission
- [ ] Submit button shows loading state
- [ ] Button text changes to "Creating..."
- [ ] Spinner appears in button
- [ ] All form inputs are disabled
- [ ] Modal cannot be closed
- [ ] Cancel button is disabled

#### Successful Submission
- [ ] Job data sent to database
- [ ] Success message appears
- [ ] Message: "Job posted successfully! Professionals in your area will be notified."
- [ ] Modal closes automatically
- [ ] Form is reset
- [ ] Image previews are cleared
- [ ] Page refreshes (or job feed updates)
- [ ] New job appears in job feed

#### Failed Submission
- [ ] Error is caught
- [ ] Error message appears
- [ ] Message: "Failed to create job. Please try again."
- [ ] Modal stays open
- [ ] Form data is preserved
- [ ] User can retry submission
- [ ] Submit button is re-enabled

### 6. Data Integrity

#### Database Record
- [ ] Record inserted into `jobs` table
- [ ] All fields saved correctly
- [ ] user_id matches logged-in user
- [ ] title saved as entered
- [ ] category saved correctly
- [ ] description saved as entered
- [ ] budget_min saved as number
- [ ] budget_max saved (or null)
- [ ] budget_type saved correctly
- [ ] urgency saved correctly
- [ ] state saved correctly
- [ ] city saved correctly
- [ ] address saved (or null)
- [ ] start_date saved as date
- [ ] duration saved (or null)
- [ ] duration_unit saved correctly
- [ ] skills_required saved as array
- [ ] requirements saved (or null)
- [ ] status set to 'open'
- [ ] created_at timestamp set

#### Data Types
- [ ] budget_min is number
- [ ] budget_max is number or null
- [ ] skills_required is array
- [ ] start_date is valid date
- [ ] created_at is valid timestamp

---

## UI/UX Testing

### Visual Design
- [ ] Modal is centered on screen
- [ ] Modal has white background
- [ ] Modal has rounded corners
- [ ] Modal has shadow
- [ ] Overlay is semi-transparent black
- [ ] Overlay has blur effect
- [ ] Form fields are properly spaced
- [ ] Labels are clear and readable
- [ ] Icons are properly aligned
- [ ] Colors match app theme
- [ ] Buttons have proper styling
- [ ] Error messages are visible

### Animations
- [ ] Modal opens with smooth animation
- [ ] Modal closes with smooth animation
- [ ] Overlay fades in/out
- [ ] Modal scales and fades
- [ ] Animations are not too slow
- [ ] Animations are not too fast
- [ ] No animation jank

### Responsive Design
- [ ] Modal fits on mobile screens
- [ ] Modal is scrollable on small screens
- [ ] Form fields stack on mobile
- [ ] Form fields are side-by-side on desktop
- [ ] Buttons are full-width on mobile
- [ ] Buttons are inline on desktop
- [ ] Text is readable on all screen sizes
- [ ] Touch targets are large enough (mobile)
- [ ] No horizontal scrolling

### Loading States
- [ ] Loading spinner is visible
- [ ] Spinner is centered in button
- [ ] Spinner animates smoothly
- [ ] Loading text is clear
- [ ] Form is clearly disabled

### Error States
- [ ] Error messages are visible
- [ ] Error messages are clear
- [ ] Error colors are consistent
- [ ] Errors don't break layout
- [ ] Multiple errors can show at once

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Can tab through all fields
- [ ] Tab order is logical
- [ ] Can select dropdown with keyboard
- [ ] Can toggle radio buttons with keyboard
- [ ] Can select date with keyboard
- [ ] Can click skills with keyboard
- [ ] Can submit form with Enter key
- [ ] Can close modal with Escape key
- [ ] Focus indicators are visible
- [ ] No keyboard traps

### Screen Reader
- [ ] Labels are announced
- [ ] Required fields are announced
- [ ] Error messages are announced
- [ ] Button states are announced
- [ ] Form structure is clear
- [ ] Instructions are provided

### ARIA Attributes
- [ ] Form has proper role
- [ ] Inputs have aria-labels
- [ ] Errors have aria-describedby
- [ ] Required fields have aria-required
- [ ] Modal has aria-modal
- [ ] Close button has aria-label

### Color Contrast
- [ ] Text is readable
- [ ] Error messages have good contrast
- [ ] Disabled states are distinguishable
- [ ] Focus indicators are visible

---

## Performance Testing

### Load Time
- [ ] Modal opens quickly (< 100ms)
- [ ] No lag when typing
- [ ] Validation is fast (< 50ms)
- [ ] Image preview is fast (< 200ms)
- [ ] Form submission is reasonable (< 2s)

### Memory
- [ ] No memory leaks
- [ ] Image previews are cleaned up
- [ ] Event listeners are removed
- [ ] No excessive re-renders

### Network
- [ ] Database insert is efficient
- [ ] No unnecessary requests
- [ ] Errors are handled gracefully
- [ ] Timeout handling works

---

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile (Android)
- [ ] Safari (iOS)
- [ ] Samsung Internet
- [ ] Firefox Mobile

### Features to Test
- [ ] Modal display
- [ ] Form inputs
- [ ] Date picker
- [ ] File upload
- [ ] Animations
- [ ] Validation
- [ ] Submission

---

## Edge Cases

### Empty Form Submission
- [ ] Shows all required field errors
- [ ] Scrolls to first error
- [ ] Doesn't submit to database

### Partial Form Submission
- [ ] Shows only missing field errors
- [ ] Preserves filled data
- [ ] Doesn't submit to database

### Invalid Data
- [ ] Budget max < budget min: Shows error
- [ ] Past date: Shows error
- [ ] Description < 50 chars: Shows error
- [ ] Invalid image type: Shows alert
- [ ] Oversized image: Shows alert

### Network Issues
- [ ] Handles connection loss
- [ ] Shows appropriate error
- [ ] Allows retry
- [ ] Doesn't lose form data

### Authentication Issues
- [ ] Handles expired session
- [ ] Redirects to login if needed
- [ ] Preserves form data (if possible)

### Concurrent Submissions
- [ ] Prevents double submission
- [ ] Button disabled during submit
- [ ] Modal locked during submit

---

## Integration Testing

### With Home Dashboard
- [ ] Modal state managed correctly
- [ ] Plus button triggers modal
- [ ] Modal closes properly
- [ ] Job feed refreshes after creation

### With Auth Context
- [ ] User ID is correct
- [ ] Authentication is checked
- [ ] User data is available

### With Supabase
- [ ] Connection is established
- [ ] Insert query works
- [ ] Error handling works
- [ ] Response is processed

### With Nigerian Components
- [ ] NigerianStateSelect works
- [ ] States load correctly
- [ ] State selection works
- [ ] City resets on state change

---

## Security Testing

### Input Sanitization
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] Script tags are escaped
- [ ] Special characters handled

### Authentication
- [ ] User must be logged in
- [ ] User ID is verified
- [ ] Session is valid
- [ ] Unauthorized access prevented

### File Upload
- [ ] Only images accepted
- [ ] File size limited
- [ ] File type validated
- [ ] Malicious files rejected

### Database
- [ ] RLS policies enforced
- [ ] User can only create own jobs
- [ ] Data is validated server-side
- [ ] Injection attacks prevented

---

## User Acceptance Testing

### User Scenarios

#### Scenario 1: Simple Job Post
- [ ] User opens modal
- [ ] Fills only required fields
- [ ] Submits successfully
- [ ] Job appears in feed

#### Scenario 2: Detailed Job Post
- [ ] User opens modal
- [ ] Fills all fields
- [ ] Uploads images
- [ ] Selects skills
- [ ] Submits successfully
- [ ] All data saved correctly

#### Scenario 3: Error Correction
- [ ] User submits empty form
- [ ] Sees error messages
- [ ] Corrects errors
- [ ] Submits successfully

#### Scenario 4: Form Abandonment
- [ ] User opens modal
- [ ] Fills some fields
- [ ] Closes modal
- [ ] Data is not saved (expected)

#### Scenario 5: Image Upload
- [ ] User uploads 5 images
- [ ] Previews all images
- [ ] Removes one image
- [ ] Uploads another
- [ ] Submits with images

---

## Regression Testing

### After Code Changes
- [ ] All tests still pass
- [ ] No new bugs introduced
- [ ] Performance not degraded
- [ ] UI not broken

### After Dependency Updates
- [ ] Modal still works
- [ ] Form still works
- [ ] Validation still works
- [ ] Submission still works

---

## Documentation Testing

### User Documentation
- [ ] HOW_TO_POST_A_JOB.md is accurate
- [ ] Examples are correct
- [ ] Screenshots match UI (if added)
- [ ] Instructions are clear

### Developer Documentation
- [ ] README_CREATE_JOB.md is accurate
- [ ] Code examples work
- [ ] API documentation is correct
- [ ] Props are documented correctly

### Technical Documentation
- [ ] JOB_CREATION_FEATURE.md is accurate
- [ ] Database schema is correct
- [ ] Flow diagrams are accurate
- [ ] Future enhancements are noted

---

## Sign-Off

### Testing Complete
- [ ] All functional tests passed
- [ ] All UI/UX tests passed
- [ ] All accessibility tests passed
- [ ] All performance tests passed
- [ ] All browser tests passed
- [ ] All edge cases handled
- [ ] All integration tests passed
- [ ] All security tests passed
- [ ] All user scenarios tested
- [ ] Documentation is accurate

### Issues Found
- [ ] All critical issues resolved
- [ ] All major issues resolved
- [ ] Minor issues documented
- [ ] Known limitations documented

### Ready for Production
- [ ] Feature is complete
- [ ] Tests are passing
- [ ] Documentation is complete
- [ ] Team has reviewed
- [ ] Stakeholders have approved

---

**Tester Name**: ___________________________

**Date**: ___________________________

**Signature**: ___________________________

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________