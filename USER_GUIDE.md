# User Guide: New Features

## 📸 Image Upload Feature

### What You'll See

When creating a job, you'll now see an **"Add Images"** button with a camera icon.

### How to Use It

1. **Start Creating a Job**
   - Click the **+** button at the bottom of the screen
   - Fill in your job details (title, description, budget, etc.)

2. **Add Images**
   - Scroll down to find the **"Add Images"** button
   - Click it to open your file picker
   - Select 1-5 images from your device
   - **Limits**: 
     - Maximum 5 images per job
     - Each image must be under 5MB
     - Only image files (JPG, PNG, GIF, etc.)

3. **Preview Your Images**
   - After selecting, you'll see thumbnails of your images
   - Each thumbnail has an **X** button to remove it
   - You can add more images until you reach 5

4. **Post Your Job**
   - Click **"Post Job"** button
   - Your job will be created first
   - Then images will be uploaded automatically
   - You'll see a success message when done

5. **View Your Images**
   - Go to the job details page
   - Scroll down to see the **Image Gallery**
   - Your uploaded images will be displayed in a grid
   - Click any image to view it full-screen

### Tips
- ✅ Use clear, well-lit photos
- ✅ Show the work area from different angles
- ✅ Include any relevant details in the photos
- ❌ Don't upload blurry or dark images
- ❌ Don't exceed 5MB per image

---

## 🔖 Save Jobs Feature

### What You'll See

When viewing any job details (that you didn't post), you'll see a **bookmark icon** in the top right corner.

### How to Use It

1. **Save a Job**
   - Browse jobs on the home page
   - Click **"View Details"** on any job you're interested in
   - Look at the top right corner
   - Click the **bookmark icon** (outline)
   - The icon will fill in (solid) to show it's saved
   - A confirmation dialog will appear

2. **Confirmation Dialog**
   - Message: "Job saved successfully! Would you like to view all your saved jobs?"
   - Click **OK** to go to your saved jobs page
   - Click **Cancel** to stay on the current job

3. **View All Saved Jobs**
   - From the app menu, select **"Saved Jobs"**
   - Or navigate to `/saved-jobs` in the URL
   - You'll see a list of all jobs you've saved
   - Each job shows the same info as the home feed:
     - Job title
     - Category
     - Location
     - Budget
     - Posted date
     - Urgency badge (if urgent)

4. **Unsave a Job**
   - Open the job details
   - Click the **filled bookmark icon**
   - The icon will become an outline again
   - Message: "Job removed from saved jobs"

5. **Empty State**
   - If you haven't saved any jobs yet, you'll see:
     - A bookmark icon
     - Message: "No saved jobs yet"
     - Description: "Jobs you save will appear here"
     - **"Browse Jobs"** button to go back to home

### When You Can Save Jobs
- ✅ When viewing jobs posted by others
- ❌ You cannot save your own jobs (doesn't make sense)
- ✅ You must be logged in to save jobs

### Tips
- 💡 Save jobs you want to apply to later
- 💡 Save jobs to compare with others
- 💡 Save jobs to share with colleagues
- 💡 Your saved jobs persist across sessions (they're stored in the database)

---

## 🔗 Share Jobs Feature

### What You'll See

When viewing any job details, you'll see a **share icon** in the top right corner (next to the bookmark icon).

### How to Use It

1. **Share a Job**
   - Open any job details page
   - Click the **share icon** (top right)
   - What happens next depends on your device:

2. **On Mobile Devices**
   - Native share menu will open
   - You can share via:
     - WhatsApp
     - Email
     - SMS
     - Social media
     - Any other app that supports sharing

3. **On Desktop/Laptop**
   - The job link will be copied to your clipboard
   - You'll see an alert: "Link copied to clipboard!"
   - Paste the link anywhere you want to share it

4. **What Gets Shared**
   - Job title
   - Description: "Check out this job opportunity: [Job Title]"
   - Direct link to the job details page

### Who Can Share
- ✅ Anyone viewing the job (poster or professional)
- ✅ No login required to view shared links
- ✅ Shared links work for anyone

### Tips
- 💡 Share jobs with colleagues who might be interested
- 💡 Share your own posted jobs to get more applicants
- 💡 Share jobs on social media to help others find work
- 💡 The link goes directly to the job details page

---

## 🎯 User Scenarios

### Scenario 1: Job Poster with Images
**You want to post a plumbing job and show the broken pipe**

1. Click **+** to create a job
2. Fill in: "Fix Leaking Pipe in Kitchen"
3. Add description and budget
4. Click **"Add Images"**
5. Select photos of the leaking pipe
6. Preview the images
7. Click **"Post Job"**
8. Share the job link with plumbers you know

**Result**: Professionals can see exactly what needs to be fixed before applying!

### Scenario 2: Professional Browsing Jobs
**You're a carpenter looking for work**

1. Browse jobs on the home page
2. See an interesting carpentry job
3. Click **"View Details"**
4. Review the job description and images
5. Click **bookmark icon** to save it
6. Continue browsing and save more jobs
7. Later, go to **"Saved Jobs"** to review all saved jobs
8. Apply to the ones you want

**Result**: You have a curated list of jobs you're interested in!

### Scenario 3: Sharing a Job
**You found a job perfect for your friend**

1. Open the job details
2. Click the **share icon**
3. On WhatsApp, send to your friend
4. Your friend clicks the link
5. They see the full job details
6. They can apply if interested

**Result**: You helped your friend find work!

---

## 🎨 Visual Indicators

### Bookmark Icon States
- **Outline (empty)**: Job is not saved
- **Filled (solid)**: Job is saved
- **Not visible**: You're viewing your own job (can't save it)

### Image Gallery
- **Grid layout**: Shows all images in a responsive grid
- **Click to expand**: Click any image to view full-screen
- **No images**: Gallery section doesn't appear

### Saved Jobs Page
- **Count badge**: Shows number of saved jobs
- **Empty state**: Friendly message when no saved jobs
- **Loading state**: Skeleton cards while loading
- **Error state**: Error message with retry button

---

## ⚠️ Important Notes

### Image Upload
- Images are uploaded **after** the job is created
- If image upload fails, the job is still created (you can add images later when edit feature is available)
- Images are stored in Supabase Storage (secure and fast)
- Images are publicly viewable (anyone can see them)

### Saved Jobs
- Saved jobs are private (only you can see your saved jobs)
- Saved jobs persist across devices (if you login on another device)
- You can save unlimited jobs
- Saved jobs are stored in the database (not in browser storage)

### Share Feature
- Shared links are public (anyone with the link can view the job)
- Shared links don't expire
- You don't need to be logged in to view a shared job
- Share feature works on all devices and browsers

---

## 🚀 Getting Started

1. **First Time Setup** (One-time only)
   - Run the database migrations (see QUICK_START.md)
   - Verify setup with `node verify-setup.js`

2. **Start Using Features**
   - Login to the app
   - Create a job with images
   - Browse and save interesting jobs
   - Share jobs with others

3. **Explore**
   - Try all three features
   - See how they work together
   - Provide feedback for improvements

---

## 📞 Support

If you encounter any issues:
- Check the **QUICK_START.md** for setup help
- Run `node verify-setup.js` to diagnose problems
- Check browser console (F12) for error messages
- Review **SETUP_INSTRUCTIONS.md** for detailed troubleshooting

---

## 🎉 Enjoy!

These features make Excel Meet more powerful and user-friendly. Happy job posting and job hunting! 🚀