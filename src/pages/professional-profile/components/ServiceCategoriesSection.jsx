import React from 'react';

const ServiceCategoriesSection = ({ categories }) => {
  const categoryLabels = {
    'information-technology': 'Information Technology',
    'engineering': 'Engineering',
    'healthcare': 'Healthcare',
    'education': 'Education',
    'finance-accounting': 'Finance and Accounting',
    'marketing-advertising': 'Marketing and Advertising',
    'sales-business-development': 'Sales and Business Development',
    'human-resources': 'Human Resources',
    'customer-service': 'Customer Service',
    'administration-office-support': 'Administration and Office Support',
    'legal': 'Legal',
    'manufacturing-production': 'Manufacturing and Production',
    'construction-skilled-trades': 'Construction and Skilled Trades',
    'logistics-supply-chain': 'Logistics and Supply Chain',
    'hospitality-tourism': 'Hospitality and Tourism',
    'creative-arts-design': 'Creative Arts and Design',
    'media-communications': 'Media and Communications',
    'science-research': 'Science and Research',
    'agriculture-farming': 'Agriculture and Farming',
    'public-sector-government': 'Public Sector and Government',
    'nonprofit-community-services': 'Nonprofit and Community Services',
    'real-estate-property': 'Real Estate and Property',
    'retail': 'Retail',
    'security-law-enforcement': 'Security and Law Enforcement',
    'transportation-driving': 'Transportation and Driving'
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border-b border-border px-4 lg:px-6 py-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Service Categories</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((category, index) => (
          <div
            key={index}
            className="bg-secondary/10 text-secondary px-4 py-2 rounded-lg text-sm font-medium"
          >
            {categoryLabels[category] || category}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategoriesSection;