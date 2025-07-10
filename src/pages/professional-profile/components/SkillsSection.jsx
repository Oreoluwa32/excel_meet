import React from 'react';

const SkillsSection = ({ skills }) => {
  return (
    <div className="bg-card border-b border-border px-4 lg:px-6 py-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Skills & Expertise</h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
          >
            {skill.name}
            {skill.level && (
              <span className="ml-1 text-xs opacity-75">
                ({skill.level})
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsSection;