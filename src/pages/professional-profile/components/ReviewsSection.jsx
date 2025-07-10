import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ReviewsSection = ({ reviews }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-card border-b border-border px-4 lg:px-6 py-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Reviews ({reviews.length})
      </h2>
      
      <div className="space-y-6">
        {displayedReviews.map((review, index) => (
          <div key={index} className="space-y-3">
            {/* Reviewer Info */}
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={review.reviewerAvatar}
                  alt={review.reviewerName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">
                      {review.reviewerName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(review.date)}
                    </p>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Icon
                        key={i}
                        name="Star"
                        size={14}
                        className={i < review.rating ? 'text-warning fill-current' : 'text-muted-foreground'}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Service Type */}
                {review.serviceType && (
                  <div className="mt-1">
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      {review.serviceType}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Review Content */}
            <div className="ml-13">
              <p className="text-foreground leading-relaxed">
                {review.comment}
              </p>
              
              {/* Professional Response */}
              {review.professionalResponse && (
                <div className="mt-3 bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="MessageCircle" size={14} className="text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Professional Response
                    </span>
                  </div>
                  <p className="text-sm text-foreground">
                    {review.professionalResponse}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Show More/Less Button */}
        {reviews.length > 3 && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;