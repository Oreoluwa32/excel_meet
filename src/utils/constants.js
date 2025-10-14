/**
 * Application Constants
 * Centralized constants used across the application
 */

// Job and Professional Categories
export const JOB_CATEGORIES = [
  'Information Technology',
  'Engineering',
  'Healthcare',
  'Education',
  'Finance and Accounting',
  'Marketing and Advertising',
  'Sales and Business Development',
  'Human Resources',
  'Customer Service',
  'Administration and Office Support',
  'Legal',
  'Manufacturing and Production',
  'Construction and Skilled Trades',
  'Logistics and Supply Chain',
  'Hospitality and Tourism',
  'Creative Arts and Design',
  'Media and Communications',
  'Science and Research',
  'Agriculture and Farming',
  'Public Sector and Government',
  'Nonprofit and Community Services',
  'Real Estate and Property',
  'Retail',
  'Security and Law Enforcement',
  'Transportation and Driving'
];

// Category Icons Mapping
export const CATEGORY_ICONS = {
  'Information Technology': 'Code',
  'Engineering': 'Cog',
  'Healthcare': 'Heart',
  'Education': 'GraduationCap',
  'Finance and Accounting': 'DollarSign',
  'Marketing and Advertising': 'Megaphone',
  'Sales and Business Development': 'TrendingUp',
  'Human Resources': 'Users',
  'Customer Service': 'Headphones',
  'Administration and Office Support': 'FileText',
  'Legal': 'Scale',
  'Manufacturing and Production': 'Factory',
  'Construction and Skilled Trades': 'Hammer',
  'Logistics and Supply Chain': 'Truck',
  'Hospitality and Tourism': 'Hotel',
  'Creative Arts and Design': 'Palette',
  'Media and Communications': 'Radio',
  'Science and Research': 'Microscope',
  'Agriculture and Farming': 'Sprout',
  'Public Sector and Government': 'Building',
  'Nonprofit and Community Services': 'HandHeart',
  'Real Estate and Property': 'Home',
  'Retail': 'ShoppingBag',
  'Security and Law Enforcement': 'Shield',
  'Transportation and Driving': 'Car'
};

// Job Urgency Levels
export const URGENCY_LEVELS = [
  { value: 'urgent', label: 'Urgent (Within 24 hours)', color: 'text-red-600' },
  { value: 'high', label: 'High Priority (1-3 days)', color: 'text-orange-600' },
  { value: 'normal', label: 'Normal (Within a week)', color: 'text-blue-600' },
  { value: 'low', label: 'Low Priority (Flexible)', color: 'text-gray-600' }
];

// Popular Skills
export const POPULAR_SKILLS = [
  'Licensed Professional',
  'Insured',
  'Background Checked',
  'Emergency Service',
  'Weekend Available',
  'Same Day Service',
  'Free Consultation',
  'Warranty Provided',
  'Years of Experience',
  'Certified',
  'Bonded',
  'References Available'
];

// Sort Options
export const SORT_OPTIONS = {
  JOBS: [
    { value: 'relevance', label: 'Best Match' },
    { value: 'newest', label: 'Newest First' },
    { value: 'budget_high', label: 'Highest Budget' },
    { value: 'budget_low', label: 'Lowest Budget' }
  ],
  PROFESSIONALS: [
    { value: 'relevance', label: 'Best Match' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' }
  ]
};

// Rating Options
export const RATING_OPTIONS = [
  { value: '4', label: '4+ stars' },
  { value: '3', label: '3+ stars' },
  { value: '2', label: '2+ stars' },
  { value: '1', label: '1+ stars' },
  { value: 'any', label: 'Any rating' }
];

// Distance Options
export const DISTANCE_OPTIONS = [
  { value: '5', label: 'Within 5 km' },
  { value: '10', label: 'Within 10 km' },
  { value: '25', label: 'Within 25 km' },
  { value: '50', label: 'Within 50 km' },
  { value: 'any', label: 'Any distance' }
];

export default {
  JOB_CATEGORIES,
  CATEGORY_ICONS,
  URGENCY_LEVELS,
  POPULAR_SKILLS,
  SORT_OPTIONS,
  RATING_OPTIONS,
  DISTANCE_OPTIONS
};