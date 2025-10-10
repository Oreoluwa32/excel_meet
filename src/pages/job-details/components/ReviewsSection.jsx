import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const ReviewsSection = ({ reviews, loading }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={14}
        className={index < rating ? 'text-warning' : 'text-muted-foreground/30'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="bg-card border-b border-border p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Reviews</h3>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-24"></div>
                <div className="h-12 bg-muted rounded animate-pulse w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-card border-b border-border p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Reviews</h3>
        <div className="text-center py-8">
          <Icon name="MessageSquare" size={48} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No reviews yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-b border-border p-4 lg:p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Reviews ({reviews.length})
      </h3>
      
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
            <div className="flex items-start space-x-3">
              <Image
                src={review.reviewer.avatar}
                alt={review.reviewer.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-foreground">{review.reviewer.name}</h4>
                  <span className="text-sm text-muted-foreground">{review.date}</span>
                </div>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-2">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {review.rating}/5
                  </span>
                </div>
                
                <p className="text-foreground text-sm leading-relaxed mb-2">
                  {review.comment}
                </p>
                
                {review.serviceDate && (
                  <div className="text-xs text-muted-foreground">
                    Service completed on {review.serviceDate}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;