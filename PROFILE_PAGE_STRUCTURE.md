# User Profile Page - Visual Structure

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│                    "Profile" + Back Button                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    PROFILE HEADER                            │
│  ┌────────┐                                                  │
│  │        │  John Doe ✓                                      │
│  │ Avatar │  john@example.com                                │
│  │   📷   │  Lagos, Nigeria • Joined Jan 2024                │
│  └────────┘  ⭐ 4.8 (24 reviews) • 15 jobs completed         │
│                                          [Edit Profile]       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              PERSONAL INFORMATION                [Edit]      │
├─────────────────────────────────────────────────────────────┤
│  Full Name:     John Doe                                     │
│  Email:         john@example.com (cannot be changed)         │
│  Phone:         +234 XXX XXX XXXX                           │
│  Location:      Lagos, Nigeria                               │
│  Bio:           Professional plumber with 10 years...        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              NIGERIAN PROFILE SETTINGS                       │
├─────────────────────────────────────────────────────────────┤
│  State:         Lagos                                        │
│  City:          Ikeja                                        │
│  Postal Code:   100001                                       │
│  Phone:         +234 XXX XXX XXXX                           │
│  Currency:      Nigerian Naira (₦)                          │
│                                                              │
│  Identity Verification                                       │
│  Status: ✓ Verified                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         PROFESSIONAL PROFILE (Professionals Only)    [▼]     │
└─────────────────────────────────────────────────────────────┘
│  Skills & Expertise                          [Edit Skills]   │
│  [Plumbing] [Electrical] [Repairs] [+]                      │
│                                                              │
│  Service Categories                                          │
│  Primary: Plumbing                                           │
│                                                              │
│  Portfolio                                    [Add Work]     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Image   │  │  Image   │  │  Image   │                 │
│  │ Project1 │  │ Project2 │  │ Project3 │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                              │
│  Verification Status                                         │
│  ● Verified Professional                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    JOB HISTORY                       [▼]     │
└─────────────────────────────────────────────────────────────┘
│  [Completed] [Active] [Posted]                              │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Kitchen Plumbing Repair              $150           │   │
│  │ Sarah Johnson • Dec 15, 2024                        │   │
│  │ ⭐⭐⭐⭐⭐ (5/5)                                      │   │
│  │ "Excellent work! Fixed quickly..."                  │   │
│  │                              [View Details]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Performance Summary                                         │
│  Jobs: 15  |  Avg Rating: 4.8  |  Earned: $2,250           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  SUBSCRIPTION PLAN                   👑      │
├─────────────────────────────────────────────────────────────┤
│  Current Plan: Pro (₦8,000/month)                          │
│  ✓ Enhanced job search                                      │
│  ✓ Unlimited applications                                   │
│  ✓ Ad-free experience                                       │
│  ✓ Priority support                                         │
│                                                              │
│  Upgrade Your Plan                                           │
│  ┌──────────┐  ┌──────────┐                               │
│  │  Elite   │  │  Custom  │                               │
│  │ ₦16,000  │  │  Contact │                               │
│  │ [Upgrade]│  │   [Info] │                               │
│  └──────────┘  └──────────┘                               │
│                                                              │
│  Next billing: Jan 15, 2025                                 │
│  Payment: •••• 1234                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  PAYMENT METHODS                     [▼]     │
└─────────────────────────────────────────────────────────────┘
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 💳 •••• •••• •••• 1234              [Default]       │   │
│  │ Expires 12/25 • John Doe                            │   │
│  │                    [Set Default] [Remove]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [+ Add New Payment Method]                                 │
│                                                              │
│  Recent Transactions                                         │
│  Dec 01, 2024  Pro Plan Subscription    ₦8,000  ✓          │
│  Nov 01, 2024  Pro Plan Subscription    ₦8,000  ✓          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  ACCOUNT SETTINGS                    [▼]     │
└─────────────────────────────────────────────────────────────┘
│  Password                              [Change Password]     │
│                                                              │
│  Language & Region                                           │
│  Language: English                                           │
│                                                              │
│  Notification Preferences                                    │
│  ☑ Email notifications                                      │
│  ☑ Push notifications                                       │
│  ☐ SMS notifications                                        │
│  ☑ Job alerts                                               │
│  ☐ Promotional emails                                       │
│                                                              │
│                                    [Save Settings]           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      [Sign Out]                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              BOTTOM TAB NAVIGATION                           │
│         [Home]        [Search]        [Profile]              │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
UserProfileManagement (Main Page)
│
├── Header
│   ├── Title: "Profile"
│   └── Back Button
│
├── ProfileHeader
│   ├── Avatar Image
│   │   └── Camera Button → AvatarUploadModal
│   ├── User Info
│   │   ├── Name + Verification Badge
│   │   ├── Email
│   │   ├── Location + Join Date
│   │   └── Professional Stats (if professional)
│   └── Edit Profile Button
│
├── PersonalInfoSection
│   ├── Section Header + Edit Button
│   ├── Form Fields (when editing)
│   │   ├── Full Name Input
│   │   ├── Email (read-only)
│   │   ├── Phone Input
│   │   ├── Location Input
│   │   └── Bio Textarea
│   └── Save/Cancel Buttons (when editing)
│
├── NigerianProfileSection
│   ├── Section Header
│   ├── Form Fields
│   │   ├── State Select
│   │   ├── City Select (dynamic)
│   │   ├── Postal Code Input
│   │   ├── Phone Input
│   │   └── Currency Select
│   ├── Save Button
│   └── Identity Verification
│       └── NigerianVerificationForm
│
├── ProfessionalSection (if professional)
│   ├── Collapsible Header
│   ├── Skills Management
│   │   ├── Skill Tags
│   │   ├── Add Skill Input (when editing)
│   │   └── Edit/Done Button
│   ├── Service Categories
│   │   └── Category Select
│   ├── Portfolio Management
│   │   ├── Portfolio Grid
│   │   ├── Add Work Form (when adding)
│   │   └── Add Work Button
│   └── Verification Status
│       ├── Status Indicator
│       └── Submit Documents Button
│
├── JobHistorySection
│   ├── Collapsible Header
│   ├── Tab Navigation
│   │   ├── Completed Tab
│   │   ├── Active Tab
│   │   └── Posted Tab (if not professional)
│   ├── Job Cards
│   │   ├── Job Info
│   │   ├── Client/Status Info
│   │   ├── Rating/Review (if completed)
│   │   └── View Details Button
│   └── Performance Summary (if completed jobs)
│
├── SubscriptionSection
│   ├── Section Header
│   ├── Current Plan Display
│   │   ├── Plan Name + Price
│   │   ├── Features List
│   │   └── Limitations List
│   ├── Upgrade Options
│   │   └── Plan Cards with Upgrade Buttons
│   ├── Billing Info
│   └── Cancel Subscription Button (if paid)
│
├── PaymentMethodsSection
│   ├── Collapsible Header
│   ├── Saved Cards List
│   │   └── Card Items
│   │       ├── Card Info
│   │       ├── Default Badge
│   │       ├── Set Default Button
│   │       └── Remove Button
│   ├── Add New Card Button
│   ├── Add Card Form (when adding)
│   │   ├── Card Details Inputs
│   │   ├── Billing Address Inputs
│   │   └── Add/Cancel Buttons
│   └── Recent Transactions
│       └── Transaction Items
│
├── AccountSettingsSection
│   ├── Collapsible Header
│   ├── Password Section
│   │   ├── Change Password Button
│   │   └── Password Form (when changing)
│   ├── Language Section
│   │   └── Language Select
│   ├── Notifications Section
│   │   └── Notification Toggles
│   └── Save Settings Button
│
├── Sign Out Section
│   └── Sign Out Button
│
└── BottomTabNavigation
    ├── Home Tab
    ├── Search Tab
    └── Profile Tab (active)
```

## Modal Components

```
AvatarUploadModal (Overlay)
├── Modal Header
│   ├── Title: "Update Profile Picture"
│   └── Close Button
├── Modal Body
│   ├── Avatar Preview
│   │   └── Camera Button
│   ├── File Input (hidden)
│   ├── Upload Area
│   ├── Error Message (if error)
│   └── Info Text
└── Modal Footer
    ├── Remove Photo Button
    └── Action Buttons
        ├── Cancel Button
        └── Upload Button
```

## State Flow Diagram

```
User Action
    ↓
Component Event Handler
    ↓
Local State Update (if needed)
    ↓
API Call (Auth Context)
    ↓
Supabase Request
    ↓
Database Update
    ↓
Response
    ↓
Context State Update
    ↓
Component Re-render
    ↓
UI Update
    ↓
Success/Error Notification
```

## Data Flow Example: Updating Profile

```
1. User clicks "Edit" in Personal Info Section
   ↓
2. Component enters edit mode (isEditing = true)
   ↓
3. User modifies form fields
   ↓
4. User clicks "Save"
   ↓
5. Component calls updateProfile() from Auth Context
   ↓
6. Auth Context calls authService.updateUserProfile()
   ↓
7. authService makes Supabase API call
   ↓
8. Supabase updates database
   ↓
9. Success response returned
   ↓
10. Auth Context updates userProfile state
    ↓
11. Component exits edit mode
    ↓
12. UI shows updated information
    ↓
13. Success notification displayed
```

## Responsive Breakpoints

```
Mobile (< 768px)
├── Single column layout
├── Full-width sections
├── Bottom tab navigation
├── Stacked form fields
└── Touch-optimized buttons

Tablet (768px - 1024px)
├── Two-column layout (some sections)
├── Wider sections
├── Bottom tab navigation
├── Grid layouts (2 columns)
└── Larger touch targets

Desktop (> 1024px)
├── Multi-column layout
├── Max-width container (7xl)
├── Top navigation bar
├── Grid layouts (3-4 columns)
└── Hover states
```

## Section Visibility Rules

```
All Users:
✓ Profile Header
✓ Personal Information
✓ Nigerian Profile
✓ Job History
✓ Subscription
✓ Payment Methods
✓ Account Settings
✓ Sign Out

Professionals Only:
✓ Professional Section
  ├── Skills
  ├── Portfolio
  └── Verification

Non-Professionals:
✓ Posted Jobs Tab (in Job History)

Paid Plans Only:
✓ Cancel Subscription Button
```

## Interactive Elements

```
Clickable Elements:
├── Buttons
│   ├── Edit Profile
│   ├── Edit (sections)
│   ├── Save/Cancel
│   ├── Upload
│   ├── Add/Remove
│   ├── Upgrade
│   └── Sign Out
├── Links
│   ├── View Details
│   └── Navigation tabs
├── Icons
│   ├── Camera (avatar)
│   ├── Chevrons (expand/collapse)
│   └── Trash (delete)
└── Form Inputs
    ├── Text inputs
    ├── Textareas
    ├── Selects
    ├── Checkboxes
    └── File inputs
```

## Color Coding

```
Status Colors:
├── Success: Green (verified, completed)
├── Warning: Yellow (pending, in progress)
├── Error: Red (failed, not verified)
├── Info: Blue (default, primary actions)
└── Neutral: Gray (disabled, secondary)

Section Colors:
├── Background: Gray-50 (page)
├── Cards: White (sections)
├── Borders: Gray-200 (dividers)
├── Text: Gray-900 (primary)
└── Muted: Gray-600 (secondary)
```

## Loading States

```
Page Load:
├── Spinner + "Loading..." text
└── Centered on page

Section Load:
├── Skeleton loaders
└── Shimmer effect

Button Actions:
├── Spinner icon
├── "Saving..." text
└── Disabled state

Image Upload:
├── Progress bar
└── "Uploading..." text
```

## Error States

```
Form Validation:
├── Red border on input
├── Error message below field
└── Icon indicator

API Errors:
├── Error notification banner
├── Error message text
└── Retry button (if applicable)

Network Errors:
├── "Connection lost" message
├── Retry button
└── Offline indicator
```

This visual structure provides a complete overview of how the user profile page is organized and how users interact with it.