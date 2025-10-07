/**
 * Central export file for all custom hooks
 * Allows for cleaner imports: import { useDebounce, useLocalStorage } from '@/hooks'
 */

export { useAsync } from './useAsync';
export { useClickOutside } from './useClickOutside';
export { useDebounce } from './useDebounce';
export { useFetch, clearCache, clearCacheEntry } from './useFetch';
export { useIntersectionObserver } from './useIntersectionObserver';
export { useLocalStorage } from './useLocalStorage';
export { 
  useMediaQuery, 
  useIsMobile, 
  useIsTablet, 
  useIsDesktop, 
  useIsDarkMode,
  usePrefersReducedMotion 
} from './useMediaQuery';
export { useToast } from './useToast';