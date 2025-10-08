# User Profile Management - Developer Guide

## Overview
This directory contains the user profile management page and all its related components. Users can view and edit their personal information, manage subscriptions, view job history, and configure account settings.

## File Structure

```
user-profile-management/
├── index.jsx                           # Main page component
├── README.md                           # This file
└── components/
    ├── ProfileHeader.jsx               # User avatar and basic info
    ├── PersonalInfoSection.jsx         # Name, email, phone, location, bio
    ├── NigerianProfileSection.jsx      # Nigeria-specific fields and verification
    ├── ProfessionalSection.jsx         # Skills, portfolio, verification (professionals only)
    ├── JobHistorySection.jsx           # Completed, active, and posted jobs
    ├── SubscriptionSection.jsx         # Current plan and upgrade options
    ├── PaymentMethodsSection.jsx       # Saved cards and transaction history
    ├── AccountSettingsSection.jsx      # Password, notifications, language
    └── AvatarUploadModal.jsx           # Modal for uploading profile picture
```

## Main Component (index.jsx)

### Props
None - uses React Router and Auth Context

### State
- `savingData`: Boolean indicating if data is being saved

### Key Functions

#### `handleSaveProfileData(section, data)`
Handles saving data for different profile sections.

**Parameters**:
- `section` (string): The section being updated (e.g., 'skills', 'portfolio', 'password')
- `data` (any): The data to save

**Returns**: Promise

**Example**:
```javascript
await handleSaveProfileData('skills', ['Plumbing', 'Electrical']);
```

#### `handleViewJob(jobId)`
Navigates to job details page.

**Parameters**:
- `jobId` (string|number): The ID of the job to view

### User Data Structure
The component prepares a `userData` object from `userProfile`:

```javascript
{
  name: string,
  email: string,
  avatar: string (URL),
  location: string,
  joinDate: string,
  isVerified: boolean,
  isProfessional: boolean,
  rating: number,
  reviewCount: number,
  completedJobs: number,
  skills: string[],
  portfolio: object[],
  primaryCategory: string,
  verificationStatus: 'verified' | 'pending' | 'not_verified',
  settings: object,
  paymentMethods: object[]
}
```

## Component Details

### ProfileHeader.jsx

**Props**:
- `user` (object): User data object
- `onEditProfile` (function): Callback when edit is clicked

**Features**:
- Displays user avatar, name, email, location
- Shows verification badge if verified
- Professional stats (rating, reviews, completed jobs)
- Camera button to upload new avatar
- Edit profile button

**State**:
- `showAvatarModal`: Controls avatar upload modal visibility

### PersonalInfoSection.jsx

**Props**:
- `userProfile` (object): User profile from Auth Context

**Features**:
- Edit mode toggle
- Form fields: full_name, phone, location, bio
- Save/Cancel buttons
- Loading states
- Success/error notifications

**State**:
- `isEditing`: Edit mode flag
- `loading`: Save operation in progress
- `formData`: Form field values

### NigerianProfileSection.jsx

**Props**: None (uses Auth Context)

**Features**:
- Nigerian state selector
- Dynamic city dropdown based on state
- Postal code input
- Nigerian phone number input
- Currency preference selector
- Identity verification form

**State**:
- `state`, `city`, `postalCode`, `phone`, `preferredCurrency`
- `cities`: Available cities for selected state
- `loading`, `saving`, `error`, `success`

**Dependencies**:
- `NigerianStateSelect` component
- `NigerianPhoneInput` component
- `NigerianVerificationForm` component
- Supabase RPC function: `get_nigerian_cities`

### ProfessionalSection.jsx

**Props**:
- `user` (object): User data
- `onSave` (function): Callback to save changes

**Features**:
- Skills management (add/remove)
- Service category selection
- Portfolio management (add/remove projects)
- Verification status display
- Document upload for verification

**State**:
- `isExpanded`: Section expanded/collapsed
- `isEditingSkills`, `isEditingPortfolio`: Edit modes
- `newSkill`: New skill input value
- `skills`: Array of skills
- `portfolio`: Array of portfolio items
- `newPortfolioItem`: New portfolio item form data

**Conditional Rendering**:
Only renders if `user.isProfessional === true`

### JobHistorySection.jsx

**Props**:
- `user` (object): User data
- `onViewJob` (function): Callback when viewing job details

**Features**:
- Three tabs: Completed, Active, Posted
- Job cards with details
- Performance summary for completed jobs
- Empty state when no jobs

**State**:
- `isExpanded`: Section expanded/collapsed
- `activeTab`: Current tab ('completed', 'active', 'posted')

**Data Structure**:
```javascript
jobHistory = {
  completed: [{ id, title, client, clientAvatar, completedDate, amount, rating, review, category }],
  active: [{ id, title, client, clientAvatar, startDate, status, amount, category }],
  posted: [{ id, title, postedDate, status, applicants, budget, category }]
}
```

### SubscriptionSection.jsx

**Props**:
- `userProfile` (object): User profile data

**Features**:
- Current plan display with features
- Available plans for upgrade
- Billing information
- Cancel subscription button (for paid plans)

**Plans**:
- Free (₦0/month)
- Basic (₦4,000/month)
- Pro (₦8,000/month)
- Elite (₦16,000/month)

### PaymentMethodsSection.jsx

**Props**:
- `user` (object): User data
- `onSave` (function): Callback to save changes

**Features**:
- List of saved payment methods
- Add new card form
- Set default payment method
- Remove payment method
- Recent transactions list

**State**:
- `isExpanded`: Section expanded/collapsed
- `isAddingCard`: Add card form visibility
- `paymentMethods`: Array of saved cards
- `newCard`: New card form data

**Card Data Structure**:
```javascript
{
  id: number,
  cardNumber: string,
  expiryDate: string,
  cvv: string,
  cardholderName: string,
  billingAddress: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  },
  isDefault: boolean
}
```

### AccountSettingsSection.jsx

**Props**:
- `user` (object): User data
- `onSave` (function): Callback to save changes

**Features**:
- Password change form
- Language selection
- Notification preferences (email, push, SMS, job alerts, promotional)
- Save settings button

**State**:
- `isExpanded`: Section expanded/collapsed
- `isChangingPassword`: Password form visibility
- `passwordData`: { currentPassword, newPassword, confirmPassword }
- `settings`: All settings values

### AvatarUploadModal.jsx

**Props**:
- `isOpen` (boolean): Modal visibility
- `onClose` (function): Callback to close modal
- `currentAvatar` (string): Current avatar URL

**Features**:
- File selection with preview
- File validation (type, size)
- Upload progress indicator
- Remove avatar option
- Cancel/Upload buttons

**State**:
- `selectedFile`: Selected file object
- `previewUrl`: Preview image URL
- `uploading`: Upload in progress
- `error`: Error message

**Validation**:
- File type: Must be image/*
- File size: Max 5MB
- Recommended: 400x400 pixels

## Usage Examples

### Adding a New Section

1. Create component file in `components/` directory:

```javascript
// components/NewSection.jsx
import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const NewSection = ({ user, onSave }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <h3 className="text-lg font-semibold">New Section</h3>
      </button>
      
      {isExpanded && (
        <div className="p-4 border-t">
          {/* Section content */}
        </div>
      )}
    </div>
  );
};

export default NewSection;
```

2. Import and add to main page:

```javascript
// index.jsx
import NewSection from './components/NewSection';

// In the render:
<NewSection user={userData} onSave={handleSaveProfileData} />
```

### Updating User Profile

```javascript
import { useAuth } from '../../contexts/AuthContext';

const MyComponent = () => {
  const { updateProfile } = useAuth();
  
  const handleUpdate = async () => {
    const result = await updateProfile({
      full_name: 'John Doe',
      location: 'Lagos, Nigeria'
    });
    
    if (result?.success) {
      console.log('Profile updated!');
    } else {
      console.error(result?.error);
    }
  };
};
```

### Changing Password

```javascript
import { useAuth } from '../../contexts/AuthContext';

const MyComponent = () => {
  const { updatePassword } = useAuth();
  
  const handlePasswordChange = async (newPassword) => {
    const result = await updatePassword(newPassword);
    
    if (result?.success) {
      console.log('Password changed!');
    } else {
      console.error(result?.error);
    }
  };
};
```

## Styling

### Tailwind Classes Used
- Layout: `flex`, `grid`, `space-y-*`, `space-x-*`
- Colors: `bg-white`, `text-gray-*`, `border-gray-*`
- Responsive: `sm:`, `md:`, `lg:`
- Interactive: `hover:`, `focus:`, `active:`

### Custom Components
- `Button`: Reusable button component
- `Input`: Form input component
- `Select`: Dropdown select component
- `Checkbox`: Checkbox component
- `Icon`: Icon component (using lucide-react)
- `Image`: Optimized image component

## API Integration

### Auth Context Methods
- `updateProfile(updates)`: Update user profile
- `updatePassword(newPassword)`: Change password
- `signOut()`: Sign out user

### Supabase Functions
- `supabase.rpc('get_nigerian_cities', { state_name })`: Get cities for state
- `supabase.storage.from('avatars').upload()`: Upload avatar
- `supabase.from('profiles').update()`: Update profile data

## Testing

### Manual Testing Checklist
- [ ] Profile header displays correctly
- [ ] Avatar upload works
- [ ] Personal info can be edited and saved
- [ ] Nigerian profile section saves correctly
- [ ] Professional section (if applicable) works
- [ ] Job history displays correctly
- [ ] Subscription info is accurate
- [ ] Payment methods can be added/removed
- [ ] Account settings save properly
- [ ] Sign out works correctly
- [ ] Responsive design on mobile
- [ ] Loading states display
- [ ] Error messages show appropriately

### Test User Scenarios
1. **New User**: Empty profile, no jobs, free plan
2. **Professional**: Has skills, portfolio, completed jobs
3. **Premium User**: Paid subscription, payment methods
4. **Verified User**: Verification badge, verified status

## Troubleshooting

### Common Issues

**Issue**: Profile not loading
- Check if user is authenticated
- Verify Supabase connection
- Check browser console for errors

**Issue**: Changes not saving
- Check network tab for failed requests
- Verify user has permission to update
- Check for validation errors

**Issue**: Avatar upload fails
- Check file size (max 5MB)
- Verify file type is image
- Check Supabase storage permissions

**Issue**: Nigerian cities not loading
- Verify Supabase RPC function exists
- Check database has city data
- Ensure state is selected first

## Performance Optimization

### Current Optimizations
- Lazy loading of sections (expandable)
- Optimized images with proper sizing
- Debounced form inputs
- Memoized components where appropriate

### Future Optimizations
- Virtual scrolling for long lists
- Image lazy loading
- Code splitting for sections
- Service worker for offline support

## Security Considerations

### Implemented
- Protected route (authentication required)
- Input validation and sanitization
- Secure password handling
- Masked sensitive data (card numbers)
- HTTPS for all requests

### Best Practices
- Never store passwords in state
- Validate all inputs client and server-side
- Use secure file upload methods
- Implement rate limiting for API calls
- Log security-relevant events

## Accessibility

### Features
- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators
- Screen reader friendly
- High contrast text
- Proper heading hierarchy

### Testing
- Use keyboard only to navigate
- Test with screen reader (NVDA, JAWS)
- Check color contrast ratios
- Verify focus order is logical

## Contributing

When adding new features:
1. Follow existing component structure
2. Use TypeScript types (if migrating)
3. Add proper error handling
4. Include loading states
5. Write clear comments
6. Update this README
7. Test on mobile and desktop
8. Ensure accessibility compliance

## Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev)
- [React Router](https://reactrouter.com)