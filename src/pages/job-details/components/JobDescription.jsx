import React from 'react';

const JobDescription = ({ description, requirements }) => {
  return (
    <div className="bg-card border-b border-border p-4 lg:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">Job Description</h2>
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      </div>

      {requirements && requirements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Requirements</h3>
          <ul className="space-y-2">
            {requirements.map((requirement, index) => (
              <li key={index} className="flex items-start">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-foreground leading-relaxed">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JobDescription;