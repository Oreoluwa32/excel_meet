/**
 * Skeleton loader components for better loading UX
 * Shows placeholder content while data is loading
 */

/**
 * Base Skeleton component
 */
export const Skeleton = ({ className = '', width, height, circle = false }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  const shapeClasses = circle ? 'rounded-full' : 'rounded';
  
  const style = {
    width: width || '100%',
    height: height || '1rem'
  };

  return (
    <div 
      className={`${baseClasses} ${shapeClasses} ${className}`}
      style={style}
    />
  );
};

/**
 * Skeleton for text lines
 */
export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index} 
          height="0.75rem"
          width={index === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton for user card
 */
export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Skeleton circle width="3rem" height="3rem" />
        
        {/* Content */}
        <div className="flex-1 space-y-3">
          <Skeleton height="1rem" width="60%" />
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for table rows
 */
export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="2rem" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for list items
 */
export const SkeletonList = ({ items = 5, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton circle width="2.5rem" height="2.5rem" />
          <div className="flex-1 space-y-2">
            <Skeleton height="0.875rem" width="40%" />
            <Skeleton height="0.75rem" width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for profile page
 */
export const SkeletonProfile = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-6">
        <Skeleton circle width="6rem" height="6rem" />
        <div className="flex-1 space-y-3">
          <Skeleton height="1.5rem" width="40%" />
          <Skeleton height="1rem" width="60%" />
          <div className="flex gap-2">
            <Skeleton height="2rem" width="6rem" />
            <Skeleton height="2rem" width="6rem" />
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="space-y-4">
        <Skeleton height="1.25rem" width="30%" />
        <SkeletonText lines={4} />
      </div>

      <div className="space-y-4">
        <Skeleton height="1.25rem" width="30%" />
        <SkeletonText lines={3} />
      </div>
    </div>
  );
};

export default Skeleton;