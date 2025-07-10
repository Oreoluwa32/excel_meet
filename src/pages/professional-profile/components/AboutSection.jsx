import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const AboutSection = ({ about }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 200;
  const shouldTruncate = about.length > maxLength;

  const displayText = shouldTruncate && !isExpanded 
    ? about.substring(0, maxLength) + '...' 
    : about;

  return (
    <div className="bg-card border-b border-border px-4 lg:px-6 py-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">About</h2>
      
      <div className="space-y-4">
        <p className="text-foreground leading-relaxed whitespace-pre-line">
          {displayText}
        </p>
        
        {shouldTruncate && (
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AboutSection;