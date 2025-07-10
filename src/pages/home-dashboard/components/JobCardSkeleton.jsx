import React from 'react';

const JobCardSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-16 h-5 bg-muted rounded-full"></div>
            <div className="w-4 h-4 bg-muted rounded"></div>
          </div>
          <div className="w-3/4 h-6 bg-muted rounded mb-1"></div>
          <div className="w-1/2 h-6 bg-muted rounded"></div>
        </div>
        <div className="w-12 h-4 bg-muted rounded ml-2"></div>
      </div>

      {/* Location and Time */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-muted rounded"></div>
          <div className="w-20 h-4 bg-muted rounded"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-muted rounded"></div>
          <div className="w-16 h-4 bg-muted rounded"></div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="w-full h-4 bg-muted rounded"></div>
        <div className="w-2/3 h-4 bg-muted rounded"></div>
      </div>

      {/* Budget and Posted Time */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-6 bg-muted rounded"></div>
          <div className="w-12 h-4 bg-muted rounded"></div>
        </div>
        <div className="w-12 h-4 bg-muted rounded"></div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-muted rounded"></div>
        <div className="flex-1 h-9 bg-muted rounded"></div>
      </div>
    </div>
  );
};

export default JobCardSkeleton;