import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for Intersection Observer API
 * Useful for lazy loading, infinite scroll, animations on scroll, etc.
 * 
 * @param {Object} options - IntersectionObserver options
 * @returns {[React.Ref, boolean]} [ref, isIntersecting]
 * 
 * @example
 * const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });
 * 
 * return (
 *   <div ref={ref}>
 *     {isVisible && <ExpensiveComponent />}
 *   </div>
 * );
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [options]);

  return [targetRef, isIntersecting];
};

export default useIntersectionObserver;