/**
 * Central export file for all components
 * Allows for cleaner imports: import { Modal, Toast, Pagination } from '@/components'
 */

export { default as EmptyState } from './EmptyState';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as LoadingScreen } from './LoadingScreen';
export { default as Modal, ConfirmModal, AlertModal } from './Modal';
export { default as OfflineIndicator } from './OfflineIndicator';
export { default as Pagination } from './Pagination';
export { default as SearchBar } from './SearchBar';
export { default as SEO } from './SEO';
export { 
  default as Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonList, 
  SkeletonProfile 
} from './Skeleton';
export { default as Toast, ToastContainer } from './Toast';

// Google Ads Components
export { default as GoogleAd } from './GoogleAd';
export { default as AdBanner } from './AdBanner';