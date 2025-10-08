# Job Creation Feature - Flow Diagrams

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        HOME DASHBOARD                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    Welcome Section                      │    │
│  │         "Welcome back, [User Name]!"                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                   Filter Chips                          │    │
│  │  [All] [Plumbing] [Electrical] [Cleaning] ...         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    Job Feed                             │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │  Job Card 1                                   │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │  Job Card 2                                   │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│                                              ┌────────┐          │
│                                              │   +    │ ← Click │
│                                              └────────┘          │
│                                          Floating Action Button  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CREATE JOB MODAL OPENS                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Create Job Posting                              [X]    │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │  Job Title *                                            │    │
│  │  ┌───────────────────────────────────────────────┐     │    │
│  │  │ e.g., Fix leaking kitchen sink                │     │    │
│  │  └───────────────────────────────────────────────┘     │    │
│  │                                                         │    │
│  │  Service Category *                                     │    │
│  │  ┌───────────────────────────────────────────────┐     │    │
│  │  │ [Select a category ▼]                         │     │    │
│  │  └───────────────────────────────────────────────┘     │    │
│  │                                                         │    │
│  │  Job Description * (50 characters minimum)              │    │
│  │  ┌───────────────────────────────────────────────┐     │    │
│  │  │                                                │     │    │
│  │  │                                                │     │    │
│  │  └───────────────────────────────────────────────┘     │    │
│  │  0 characters (minimum 50)                              │    │
│  │                                                         │    │
│  │  Budget (Min) *          Budget (Max)                   │    │
│  │  ┌──────────────┐       ┌──────────────┐              │    │
│  │  │ ₦ 5000       │       │ ₦ 10000      │              │    │
│  │  └──────────────┘       └──────────────┘              │    │
│  │                                                         │    │
│  │  Budget Type                                            │    │
│  │  ○ Fixed Price (₦)  ○ Hourly Rate (₦/hr)              │    │
│  │                                                         │    │
│  │  Priority Level *                                       │    │
│  │  ┌───────────────────────────────────────────────┐     │    │
│  │  │ [Normal (Within a week) ▼]                    │     │    │
│  │  └───────────────────────────────────────────────┘     │    │
│  │                                                         │    │
│  │  State *                 City *                         │    │
│  │  ┌──────────────┐       ┌──────────────┐              │    │
│  │  │ [Lagos ▼]    │       │ Ikeja        │              │    │
│  │  └──────────────┘       └──────────────┘              │    │
│  │                                                         │    │
│  │  Specific Address (Optional)                            │    │
│  │  ┌───────────────────────────────────────────────┐     │    │
│  │  │ Street address or landmark                    │     │    │
│  │  └───────────────────────────────────────────────┘     │    │
│  │                                                         │    │
│  │  Preferred Start Date *  Estimated Duration             │    │
│  │  ┌──────────────┐       ┌─────┐  ┌──────────┐         │    │
│  │  │ 2024-12-25   │       │  2  │  │ Days ▼   │         │    │
│  │  └──────────────┘       └─────┘  └──────────┘         │    │
│  │                                                         │    │
│  │  Preferred Skills/Requirements (Optional)               │    │
│  │  [Licensed] [Insured] [Background Checked] ...          │    │
│  │                                                         │    │
│  │  Additional Requirements (Optional)                     │    │
│  │  ┌───────────────────────────────────────────────┐     │    │
│  │  │                                                │     │    │
│  │  └───────────────────────────────────────────────┘     │    │
│  │                                                         │    │
│  │  Photos (Optional, max 5)                               │    │
│  │  ┌─────┐ ┌─────┐ ┌─────────────────────────┐          │    │
│  │  │ IMG │ │ IMG │ │  📷 Upload photos       │          │    │
│  │  └─────┘ └─────┘ └─────────────────────────┘          │    │
│  │                                                         │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  [Cancel]                    [Create Job Posting]      │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    User fills form
                            │
                            ▼
                    User clicks Submit
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VALIDATION                                  │
│                                                                  │
│  ┌──────────────┐                                               │
│  │  Validate    │                                               │
│  │  All Fields  │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│    ┌────┴────┐                                                  │
│    │ Valid?  │                                                  │
│    └────┬────┘                                                  │
│         │                                                        │
│    ┌────┴────────────────────┐                                 │
│    │                          │                                 │
│   NO                         YES                                │
│    │                          │                                 │
│    ▼                          ▼                                 │
│  Show Errors            Process Submission                      │
│  Scroll to First              │                                 │
│  Error Field                  │                                 │
│    │                          ▼                                 │
│    │                   Show Loading State                       │
│    │                          │                                 │
│    │                          ▼                                 │
│    │                   Upload Images (TODO)                     │
│    │                          │                                 │
│    │                          ▼                                 │
│    │                   Insert to Database                       │
│    │                          │                                 │
│    │                     ┌────┴────┐                            │
│    │                     │Success? │                            │
│    │                     └────┬────┘                            │
│    │                          │                                 │
│    │                     ┌────┴────────────┐                   │
│    │                     │                 │                   │
│    │                    YES               NO                    │
│    │                     │                 │                   │
│    │                     ▼                 ▼                   │
│    │              Show Success      Show Error                 │
│    │              Close Modal       Keep Modal Open            │
│    │              Refresh Feed           │                     │
│    │                     │                │                    │
│    └─────────────────────┴────────────────┘                    │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           ▼
                    Back to Dashboard
```

## Component Hierarchy

```
HomeDashboard
│
├── Header
│   └── "Excel-meet"
│
├── Main Content
│   ├── Welcome Section
│   │   ├── Greeting
│   │   └── Subtitle
│   │
│   ├── Subscription Banner (if free plan)
│   │
│   ├── Filter Chips
│   │   ├── Category Filters
│   │   ├── Priority Filters
│   │   └── Location Filter
│   │
│   ├── Job Feed
│   │   └── Job Cards (multiple)
│   │
│   └── Preview Mode Notice (if not logged in)
│
├── FloatingActionButton
│   └── Plus Icon
│
├── CreateJobModal ← NEW
│   ├── Modal (base component)
│   │   ├── Overlay
│   │   ├── Modal Content
│   │   │   ├── Header
│   │   │   │   ├── Title
│   │   │   │   └── Close Button
│   │   │   │
│   │   │   ├── Body (scrollable)
│   │   │   │   └── Form
│   │   │   │       ├── Job Title Input
│   │   │   │       ├── Category Select
│   │   │   │       ├── Description Textarea
│   │   │   │       ├── Budget Inputs
│   │   │   │       ├── Budget Type Radio
│   │   │   │       ├── Priority Select
│   │   │   │       ├── NigerianStateSelect
│   │   │   │       ├── City Input
│   │   │   │       ├── Address Input
│   │   │   │       ├── Date Picker
│   │   │   │       ├── Duration Inputs
│   │   │   │       ├── Skills Chips
│   │   │   │       ├── Requirements Textarea
│   │   │   │       └── Image Upload
│   │   │   │           ├── Image Previews
│   │   │   │           └── Upload Button
│   │   │   │
│   │   │   └── Footer
│   │   │       ├── Cancel Button
│   │   │       └── Submit Button
│   │   │
│   │   └── (Animations via Framer Motion)
│   │
│   └── State Management
│       ├── formData
│       ├── errors
│       ├── images
│       └── isSubmitting
│
└── BottomTabNavigation
    ├── Home Tab
    ├── Search Tab
    ├── Messages Tab
    └── Profile Tab
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                              │
└─────────────────────────────────────────────────────────────────┘

HomeDashboard State:
┌──────────────────────────────────────┐
│ isCreateJobModalOpen: false          │
└──────────────────────────────────────┘
                │
                │ User clicks Plus button
                ▼
┌──────────────────────────────────────┐
│ isCreateJobModalOpen: true           │
└──────────────────────────────────────┘
                │
                │ Modal opens
                ▼
CreateJobModal State:
┌──────────────────────────────────────┐
│ formData: {                          │
│   title: '',                         │
│   category: '',                      │
│   description: '',                   │
│   budget_min: '',                    │
│   budget_max: '',                    │
│   budget_type: 'fixed',              │
│   urgency: 'normal',                 │
│   state: '',                         │
│   city: '',                          │
│   address: '',                       │
│   start_date: '',                    │
│   duration: '',                      │
│   duration_unit: 'days',             │
│   skills_required: [],               │
│   requirements: ''                   │
│ }                                    │
│ errors: {}                           │
│ images: []                           │
│ isSubmitting: false                  │
└──────────────────────────────────────┘
                │
                │ User fills form
                ▼
┌──────────────────────────────────────┐
│ formData: { ...updated values }     │
│ errors: { ...cleared as user types }│
│ images: [ ...uploaded images ]      │
│ isSubmitting: false                  │
└──────────────────────────────────────┘
                │
                │ User clicks Submit
                ▼
┌──────────────────────────────────────┐
│ isSubmitting: true                   │
│ (form disabled, loading shown)       │
└──────────────────────────────────────┘
                │
                │ Validation runs
                ▼
        ┌───────┴────────┐
        │                │
    Invalid           Valid
        │                │
        ▼                ▼
┌──────────────┐  ┌──────────────────┐
│ errors: {...}│  │ Submit to DB     │
│ isSubmitting:│  │                  │
│   false      │  │                  │
└──────────────┘  └────────┬─────────┘
        │                  │
        │                  ▼
        │          ┌───────┴────────┐
        │          │                │
        │       Success          Error
        │          │                │
        │          ▼                ▼
        │  ┌──────────────┐  ┌──────────────┐
        │  │ Reset form   │  │ Show error   │
        │  │ Close modal  │  │ Keep modal   │
        │  │ Refresh feed │  │ open         │
        │  └──────────────┘  └──────────────┘
        │          │                │
        └──────────┴────────────────┘
                   │
                   ▼
HomeDashboard State:
┌──────────────────────────────────────┐
│ isCreateJobModalOpen: false          │
└──────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INPUT                               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CreateJobModal Component                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Form Fields (Controlled Inputs)            │    │
│  │                                                         │    │
│  │  onChange handlers update local state                   │    │
│  │  ↓                                                      │    │
│  │  formData state                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Validation Logic                           │    │
│  │                                                         │    │
│  │  validateForm() checks all fields                       │    │
│  │  ↓                                                      │    │
│  │  errors state                                           │    │
│  └────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Submit Handler                             │    │
│  │                                                         │    │
│  │  handleSubmit() prepares jobData                        │    │
│  │  ↓                                                      │    │
│  │  calls onSubmit(jobData)                                │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HomeDashboard Component                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              handleCreateJob()                          │    │
│  │                                                         │    │
│  │  1. Receives jobData from modal                         │    │
│  │  2. Adds user_id from Auth Context                      │    │
│  │  3. Formats data for database                           │    │
│  │  4. Calls Supabase insert                               │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Client                             │
│                                                                  │
│  supabase.from('jobs').insert([jobRecord])                      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    jobs table                           │    │
│  │                                                         │    │
│  │  New record inserted with all job details               │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Response                                    │
│                                                                  │
│  Success: { data: newJob, error: null }                         │
│  Error:   { data: null, error: errorObject }                    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HomeDashboard Component                       │
│                                                                  │
│  If success:                                                     │
│    - Show success message                                        │
│    - Refresh job feed                                            │
│    - Close modal                                                 │
│                                                                  │
│  If error:                                                       │
│    - Show error message                                          │
│    - Keep modal open                                             │
│    - Allow user to retry                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Validation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION PROCESS                            │
└─────────────────────────────────────────────────────────────────┘

User clicks "Create Job Posting"
            │
            ▼
┌───────────────────────┐
│  validateForm()       │
└───────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────┐
│  Check each field:                                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ title                                                │    │
│  │   ✓ Not empty?                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│            │                                                  │
│            ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ category                                             │    │
│  │   ✓ Selected?                                        │    │
│  └─────────────────────────────────────────────────────┘    │
│            │                                                  │
│            ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ description                                          │    │
│  │   ✓ Not empty?                                       │    │
│  │   ✓ At least 50 characters?                          │    │
│  └─────────────────────────────────────────────────────┘    │
│            │                                                  │
│            ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ budget_min                                           │    │
│  │   ✓ Provided?                                        │    │
│  │   ✓ Greater than 0?                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│            │                                                  │
│            ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ budget_max (if provided)                             │    │
│  │   ✓ Greater than budget_min?                         │    │
│  └─────────────────────────────────────────────────────┘    │
│            │                                                  │
│            ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ state                                                │    │
│  │   ✓ Selected?                                        │    │
│  └─────────────────────────────────────────────────────┘    │
│            │                                                  │
│            ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ city                                                 │    │
│  │   ✓ Not empty?                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│            │                                                  │
│            ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ start_date                                           │    │
│  │   ✓ Provided?                                        │    │
│  │   ✓ Not in the past?                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│            │                                                  │
└────────────┼──────────────────────────────────────────────────┘
             │
             ▼
      ┌──────┴───────┐
      │              │
   Errors?        No Errors
      │              │
      ▼              ▼
┌──────────┐   ┌──────────┐
│ Set      │   │ Return   │
│ errors   │   │ true     │
│ state    │   │          │
│          │   │ Proceed  │
│ Scroll   │   │ with     │
│ to first │   │ submit   │
│ error    │   │          │
│          │   │          │
│ Return   │   │          │
│ false    │   │          │
└──────────┘   └──────────┘
```

## Image Upload Flow (Current + Future)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT IMPLEMENTATION                        │
└─────────────────────────────────────────────────────────────────┘

User selects images
        │
        ▼
┌───────────────────┐
│ handleImageUpload │
└───────────────────┘
        │
        ▼
Validate each file:
  ✓ Is image type?
  ✓ Under 5MB?
        │
        ▼
Create preview URLs
  URL.createObjectURL(file)
        │
        ▼
Store in images state:
  { file, preview, name }
        │
        ▼
Display previews
        │
        ▼
On submit:
  Include files in jobData
        │
        ▼
  ⚠️ NOT YET UPLOADED TO STORAGE


┌─────────────────────────────────────────────────────────────────┐
│                    FUTURE IMPLEMENTATION                         │
└─────────────────────────────────────────────────────────────────┘

User selects images
        │
        ▼
Validate files
        │
        ▼
Create previews
        │
        ▼
On submit:
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│  uploadJobImages(images)                                      │
│                                                               │
│  For each image:                                              │
│    1. Compress image (optional)                               │
│    2. Generate unique filename                                │
│    3. Upload to Supabase Storage                              │
│       ↓                                                       │
│       supabase.storage                                        │
│         .from('job-images')                                   │
│         .upload(filename, file)                               │
│    4. Get public URL                                          │
│       ↓                                                       │
│       supabase.storage                                        │
│         .from('job-images')                                   │
│         .getPublicUrl(filename)                               │
│    5. Collect URLs                                            │
│                                                               │
│  Return array of URLs                                         │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
Store URLs in database
  images: ['url1', 'url2', ...]
        │
        ▼
Images accessible via URLs
```

## Responsive Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE VIEW                               │
│                      (< 768px width)                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Create Job Posting            [X]  │
├─────────────────────────────────────┤
│                                     │
│  Job Title *                        │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  Category *                         │
│  ┌───────────────────────────────┐ │
│  │ [Select ▼]                    │ │
│  └───────────────────────────────┘ │
│                                     │
│  Budget (Min) *                     │
│  ┌───────────────────────────────┐ │
│  │ ₦                             │ │
│  └───────────────────────────────┘ │
│                                     │
│  Budget (Max)                       │
│  ┌───────────────────────────────┐ │
│  │ ₦                             │ │
│  └───────────────────────────────┘ │
│                                     │
│  State *                            │
│  ┌───────────────────────────────┐ │
│  │ [Select ▼]                    │ │
│  └───────────────────────────────┘ │
│                                     │
│  City *                             │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  ... (more fields)                  │
│                                     │
├─────────────────────────────────────┤
│  [Cancel]  [Create Job Posting]    │
└─────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                       DESKTOP VIEW                               │
│                      (≥ 768px width)                             │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  Create Job Posting                                      [X]  │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Job Title *                                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Budget (Min) *              Budget (Max)                     │
│  ┌─────────────────────┐    ┌─────────────────────┐         │
│  │ ₦                   │    │ ₦                   │         │
│  └─────────────────────┘    └─────────────────────┘         │
│                                                               │
│  State *                     City *                           │
│  ┌─────────────────────┐    ┌─────────────────────┐         │
│  │ [Select ▼]          │    │                     │         │
│  └─────────────────────┘    └─────────────────────┘         │
│                                                               │
│  Start Date *                Duration                         │
│  ┌─────────────────────┐    ┌────┐  ┌──────────┐            │
│  │ 2024-12-25          │    │ 2  │  │ Days ▼   │            │
│  └─────────────────────┘    └────┘  └──────────┘            │
│                                                               │
│  ... (more fields)                                            │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                    [Cancel]  [Create Job Posting]            │
└───────────────────────────────────────────────────────────────┘
```

---

**Note**: These diagrams provide a visual representation of the job creation feature's architecture, flow, and user experience. Use them as reference when implementing, testing, or explaining the feature.