# Job Details Page - Real Data Integration

## Overview
Updated the Job Details page to display real job data from Supabase database instead of hardcoded mock data. When users click "View Details" on a job card, they now see the actual details of that specific job.

## Changes Made

### 1. Updated `src/pages/job-details/index.jsx`

#### Added Imports
- `useLocation` from `react-router-dom` - to access navigation state
- `fetchJobById` from `../../utils/jobService` - to fetch job data from database
- `useAuth` from `../../contexts/AuthContext` - to check if user is the job poster

#### New State Management
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [jobData, setJobData] = useState(null);
```

#### Data Fetching Logic
- Retrieves `jobId` from navigation state passed by JobCard component
- Fetches job data from Supabase using `fetchJobById(jobId)`
- Determines if current user is the job poster (to show appropriate actions)
- Handles loading and error states gracefully

#### Data Transformation
Added helper functions to transform database data to UI format:
- `formatTimePeriod()` - Converts start_date, duration, and duration_unit to readable format
- `formatBudget()` - Formats budget_min and budget_max with Nigerian Naira symbol
- `formatTimeAgo()` - Converts created_at timestamp to relative time (e.g., "2 hours ago")

#### Transformed Job Data Structure
```javascript
{
  id: jobData.id,
  title: jobData.title,
  category: jobData.category,
  postedDate: formatTimeAgo(jobData.created_at),
  location: `${jobData.city}, ${jobData.state}`,
  coordinates: { lat: jobData.latitude, lng: jobData.longitude },
  timePeriod: formatTimePeriod(jobData.start_date, jobData.duration, jobData.duration_unit),
  isUrgent: jobData.urgency === 'urgent',
  description: jobData.description,
  requirements: jobData.requirements || [],
  images: jobData.images || [],
  budget: formatBudget(jobData.budget_min, jobData.budget_max),
  isPremium: false
}
```

#### UI States

**Loading State:**
- Shows spinner with "Loading job details..." message
- Displayed while fetching data from database

**Error State:**
- Shows error icon and message
- Provides "Back to Home" button for navigation
- Handles cases where:
  - No job ID is provided
  - Job is not found
  - Database fetch fails

**Success State:**
- Displays all job details from database
- Conditionally renders components based on data availability:
  - JobLocation only shown if coordinates exist
  - JobGallery only shown if images exist
- Shows appropriate actions based on user type (poster vs professional)

## How It Works

### Flow:
1. User clicks "View Details" button on a JobCard in the home feed
2. JobCard navigates to `/job-details` with `jobId` in state:
   ```javascript
   navigate('/job-details', { state: { jobId: job.id } });
   ```
3. JobDetails page receives the jobId and fetches data:
   ```javascript
   const jobId = location.state?.jobId;
   const { data, error } = await fetchJobById(jobId);
   ```
4. Data is transformed to match component expectations
5. Job details are displayed with all information from database

### User Type Detection:
```javascript
if (user && data.user_id === user.id) {
  setUserType('poster');
}
```
- If current user is the job poster, they see "Edit Job" and "View Applications" actions
- If current user is a professional, they see "Accept Job" and "Ask Question" actions

## Database Fields Used

From the `jobs` table:
- `id` - Unique job identifier
- `title` - Job title
- `category` - Job category
- `description` - Detailed job description
- `requirements` - Array of job requirements
- `budget_min` - Minimum budget
- `budget_max` - Maximum budget
- `budget_type` - Budget type (hourly, fixed, etc.)
- `urgency` - Urgency level (urgent, high, normal, low)
- `state` - State location
- `city` - City location
- `latitude` - Latitude coordinate (optional)
- `longitude` - Longitude coordinate (optional)
- `start_date` - Job start date
- `duration` - Job duration number
- `duration_unit` - Duration unit (days, weeks, months)
- `images` - Array of image URLs
- `user_id` - ID of user who posted the job
- `created_at` - Timestamp when job was created
- `status` - Job status (open, closed, etc.)

## Features

### ✅ Implemented
- Real-time data fetching from Supabase
- Loading state with spinner
- Error handling with user-friendly messages
- Data transformation for proper display
- User type detection (poster vs professional)
- Conditional rendering based on data availability
- Navigation back to home on error
- Budget formatting with Nigerian Naira
- Relative time display (e.g., "2 hours ago")
- Flexible time period formatting

### 🔄 Still Using Mock Data
The following components still use mock data (to be implemented in future):
- **PosterInfo** - User profile information (needs user profiles integration)
- **ReviewsSection** - User reviews (needs reviews system)
- **RelatedJobs** - Similar jobs (needs recommendation algorithm)

## Testing Checklist

- [ ] Click "View Details" on a job card
- [ ] Verify correct job details are displayed
- [ ] Check that budget is formatted correctly (₦ symbol)
- [ ] Verify location shows as "City, State"
- [ ] Check that time period is readable
- [ ] Verify "posted time ago" is accurate
- [ ] Test with job that has no images (should hide gallery)
- [ ] Test with job that has no coordinates (should hide map)
- [ ] Test error state by navigating directly to /job-details
- [ ] Verify loading state appears briefly during fetch
- [ ] Check that job poster sees different actions than professionals

## Future Enhancements

1. **User Profiles Integration**
   - Fetch poster information from users table
   - Display real poster name, avatar, rating
   - Show verified badge if applicable

2. **Reviews System**
   - Implement job reviews table
   - Fetch and display real reviews
   - Allow users to leave reviews after job completion

3. **Related Jobs Algorithm**
   - Implement recommendation system
   - Fetch jobs in same category or location
   - Show jobs with similar requirements

4. **Image Gallery Enhancement**
   - Implement image upload to Supabase Storage
   - Add image lightbox/modal view
   - Support multiple image formats

5. **Real-time Updates**
   - Subscribe to job changes
   - Update details if job is edited
   - Show notification if job is closed

6. **Save/Bookmark Feature**
   - Implement saved jobs table
   - Persist saved state to database
   - Show saved jobs in user profile

7. **Share Functionality**
   - Generate shareable links
   - Add social media sharing
   - Copy link to clipboard

## Technical Notes

- Uses React hooks (useState, useEffect) for state management
- Implements proper error boundaries
- Follows existing code patterns and conventions
- Maintains backward compatibility with existing components
- Uses defensive programming (null checks, fallbacks)
- Properly cleans up on component unmount

## Dependencies

- `react-router-dom` - For navigation and location state
- `../../utils/jobService` - For database operations
- `../../contexts/AuthContext` - For user authentication
- `../../components/ui/DetailViewModal` - For modal wrapper
- All existing job detail sub-components

## Related Files

- `src/pages/home-dashboard/components/JobCard.jsx` - Passes jobId to details page
- `src/utils/jobService.js` - Contains fetchJobById function
- `src/pages/job-details/components/*` - All detail view components
- `supabase/migrations/20250116000000_create_jobs_table.sql` - Database schema

## Notes

- The page still uses mock data for poster info and reviews (intentional for now)
- Related jobs section also uses mock data (will be replaced with real recommendations)
- Image upload functionality is not yet implemented (images array will be empty for now)
- Coordinates are optional - map only shows if latitude/longitude are provided
- Requirements field is optional - will show empty array if not provided