# Admin Dashboard

A comprehensive admin dashboard for managing the Excel Meet application, monitoring performance, and responding to user complaints.

## Features

### 1. Dashboard Overview
- **Quick Statistics**: View key metrics at a glance
  - Total users, professionals, and clients
  - Job postings and applications
  - Support tickets status
  - Reviews and ratings
- **System Health**: Monitor the operational status of core services
- **Quick Actions**: Fast access to common admin tasks

### 2. User Management
- View all users with advanced filtering
- Filter by role (admin, professional, client)
- Filter by verification status
- Filter by subscription plan
- Search users by name or email
- Edit user profiles
- Update user roles and permissions
- Manage verification status
- Delete users

### 3. Support Tickets
- View all support tickets with filtering options
- Filter by status (open, in progress, resolved, closed)
- Filter by priority (low, medium, high, urgent)
- Filter by category (bug, feature request, complaint, question, other)
- View ticket details and conversation history
- Assign tickets to admins
- Update ticket status
- Respond to user complaints
- Track ticket resolution

### 4. Job Management
- View all job postings
- Filter by status
- Search jobs by title or description
- Delete inappropriate or spam jobs
- Monitor job activity

### 5. Analytics
- User activity over time
- Job posting trends
- Application statistics
- Growth metrics visualization
- Customizable time ranges (7, 14, 30, 60, 90 days)

### 6. System Logs
- View system logs with filtering
- Filter by log level (info, warning, error, critical)
- Filter by source component
- Track system events
- Monitor errors and warnings
- Configurable log limit

## Access Control

The admin dashboard is protected by role-based access control:
- Only users with `role: 'admin'` can access the dashboard
- Non-admin users are automatically redirected to the home dashboard
- Route protection is implemented via the `AdminRoute` component

## Database Schema

### Support Tickets Table
```sql
support_tickets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category ticket_category,
  priority ticket_priority,
  status ticket_status,
  assigned_to UUID REFERENCES user_profiles(id),
  attachments JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
)
```

### Ticket Responses Table
```sql
ticket_responses (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id),
  user_id UUID REFERENCES user_profiles(id),
  message TEXT NOT NULL,
  is_admin_response BOOLEAN,
  attachments JSONB,
  created_at TIMESTAMPTZ
)
```

### App Analytics Table
```sql
app_analytics (
  id UUID PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type TEXT NOT NULL,
  metadata JSONB,
  recorded_at TIMESTAMPTZ
)
```

### System Logs Table
```sql
system_logs (
  id UUID PRIMARY KEY,
  log_level TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT,
  user_id UUID REFERENCES user_profiles(id),
  metadata JSONB,
  created_at TIMESTAMPTZ
)
```

## Usage

### Accessing the Admin Dashboard
1. Log in with an admin account
2. Navigate to `/admin-dashboard`
3. Use the tab navigation to switch between sections

### Creating an Admin User
To create an admin user, update the user's role in the database:
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### Submitting Support Tickets (Users)
Users can submit support tickets using the `SupportTicketForm` component:
```jsx
import { SupportTicketForm } from 'components';

function MyComponent() {
  const [showTicketForm, setShowTicketForm] = useState(false);

  return (
    <>
      <button onClick={() => setShowTicketForm(true)}>
        Get Support
      </button>
      <SupportTicketForm
        isOpen={showTicketForm}
        onClose={() => setShowTicketForm(false)}
        onSuccess={() => {
          // Handle success
          alert('Ticket submitted successfully!');
        }}
      />
    </>
  );
}
```

## API Service

The admin dashboard uses the `adminService` utility for all data operations:

```javascript
import adminService from 'utils/adminService';

// Get dashboard statistics
const stats = await adminService.getDashboardStats();

// Get users with filters
const users = await adminService.getUsers({ role: 'professional' });

// Get support tickets
const tickets = await adminService.getSupportTickets({ status: 'open' });

// Update ticket status
await adminService.updateSupportTicket(ticketId, { status: 'resolved' });

// Add ticket response
await adminService.addTicketResponse(ticketId, userId, message, true);
```

## Components

### Main Components
- `AdminDashboard` - Main dashboard container with tab navigation
- `DashboardOverview` - Overview statistics and quick actions
- `UserManagement` - User management interface
- `SupportTickets` - Support ticket management
- `JobManagement` - Job posting management
- `Analytics` - Analytics and metrics visualization
- `SystemLogs` - System logs viewer

### Shared Components
- `SupportTicketForm` - Form for users to submit support tickets
- `Modal` - Reusable modal component
- `Header` - Application header
- `BottomTabNavigation` - Mobile navigation

## Styling

The admin dashboard uses a purple/indigo color scheme to distinguish it from the main application:
- Primary color: Purple (#7C3AED)
- Secondary color: Indigo (#4F46E5)
- Consistent with Tailwind CSS design system

## Security

- Row Level Security (RLS) policies ensure data access control
- Admin-only operations are protected at the database level
- All sensitive operations require authentication
- User roles are verified on both client and server side

## Future Enhancements

Potential improvements for the admin dashboard:
- Real-time notifications for new tickets
- Advanced analytics with charts (using Recharts or D3.js)
- Bulk user operations
- Export data to CSV/Excel
- Email notifications for ticket updates
- Custom report generation
- Performance monitoring dashboard
- User activity tracking
- Automated ticket assignment
- SLA tracking for ticket resolution