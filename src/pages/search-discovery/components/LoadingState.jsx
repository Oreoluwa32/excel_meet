import React from 'react';

const LoadingState = ({ type }) => {
  const SkeletonCard = ({ isJob = false }) => (
    <div className="bg-card border border-border rounded-lg p-4 animate-pulse">
      {isJob ? (
        // Job Card Skeleton
        <>
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-muted rounded w-16"></div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
          <div className="h-4 bg-muted rounded w-full mb-2"></div>
          <div className="h-4 bg-muted rounded w-4/5 mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="h-4 bg-muted rounded w-20"></div>
            </div>
            <div className="h-8 bg-muted rounded w-24"></div>
          </div>
        </>
      ) : (
        // Professional Card Skeleton
        <>
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-12 h-12 bg-muted rounded-full"></div>
            <div className="flex-1">
              <div className="h-5 bg-muted rounded w-3/4 mb-1"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="flex space-x-2 mb-4">
            <div className="h-6 bg-muted rounded w-16"></div>
            <div className="h-6 bg-muted rounded w-20"></div>
            <div className="h-6 bg-muted rounded w-18"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 bg-muted rounded flex-1"></div>
            <div className="h-8 bg-muted rounded w-20"></div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Loading indicator */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Loading {type}...</span>
        </div>
      </div>

      {/* Skeleton cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonCard key={index} isJob={type === 'jobs'} />
        ))}
      </div>
    </div>
  );
};

export default LoadingState;