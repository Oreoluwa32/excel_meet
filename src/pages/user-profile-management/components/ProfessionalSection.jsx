import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';

const ProfessionalSection = ({ user, onSave }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState(user.skills || []);
  const [portfolio, setPortfolio] = useState(user.portfolio || []);
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    image: '',
    category: ''
  });

  const skillCategories = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'repairs', label: 'Repairs' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'painting', label: 'Painting' },
    { value: 'landscaping', label: 'Landscaping' }
  ];

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setNewSkill('');
      onSave('skills', updatedSkills);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    onSave('skills', updatedSkills);
  };

  const handleAddPortfolioItem = () => {
    if (newPortfolioItem.title.trim()) {
      const updatedPortfolio = [...portfolio, {
        ...newPortfolioItem,
        id: Date.now(),
        image: newPortfolioItem.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
      }];
      setPortfolio(updatedPortfolio);
      setNewPortfolioItem({ title: '', description: '', image: '', category: '' });
      onSave('portfolio', updatedPortfolio);
    }
  };

  const handleRemovePortfolioItem = (itemId) => {
    const updatedPortfolio = portfolio.filter(item => item.id !== itemId);
    setPortfolio(updatedPortfolio);
    onSave('portfolio', updatedPortfolio);
  };

  if (!user.isProfessional) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon name="Briefcase" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Professional Profile</h3>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-muted-foreground" 
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="space-y-6 mt-4">
            {/* Skills Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Skills & Expertise</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingSkills(!isEditingSkills)}
                >
                  {isEditingSkills ? 'Done' : 'Edit Skills'}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    <span>{skill}</span>
                    {isEditingSkills && (
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-error"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isEditingSkills && (
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddSkill} size="sm">
                    Add
                  </Button>
                </div>
              )}
            </div>

            {/* Service Categories */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Service Categories</h4>
              <Select
                label="Primary Category"
                options={skillCategories}
                value={user.primaryCategory || ''}
                onChange={(value) => onSave('primaryCategory', value)}
              />
            </div>

            {/* Portfolio Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Portfolio</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingPortfolio(!isEditingPortfolio)}
                >
                  {isEditingPortfolio ? 'Done' : 'Add Work'}
                </Button>
              </div>

              {isEditingPortfolio && (
                <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                  <Input
                    label="Project Title"
                    type="text"
                    value={newPortfolioItem.title}
                    onChange={(e) => setNewPortfolioItem(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                  />
                  <Input
                    label="Description"
                    type="text"
                    value={newPortfolioItem.description}
                    onChange={(e) => setNewPortfolioItem(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                  />
                  <Input
                    label="Image URL"
                    type="url"
                    value={newPortfolioItem.image}
                    onChange={(e) => setNewPortfolioItem(prev => ({
                      ...prev,
                      image: e.target.value
                    }))}
                  />
                  <Select
                    label="Category"
                    options={skillCategories}
                    value={newPortfolioItem.category}
                    onChange={(value) => setNewPortfolioItem(prev => ({
                      ...prev,
                      category: value
                    }))}
                  />
                  <Button onClick={handleAddPortfolioItem} size="sm">
                    Add to Portfolio
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {portfolio.map((item) => (
                  <div key={item.id} className="border border-border rounded-lg overflow-hidden">
                    <div className="h-32 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground">{item.title}</h5>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          {item.category && (
                            <span className="inline-block mt-2 px-2 py-1 bg-secondary/10 text-secondary text-xs rounded">
                              {skillCategories.find(cat => cat.value === item.category)?.label}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePortfolioItem(item.id)}
                          className="text-error hover:text-error"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Status */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Verification Status</h4>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${
                    user.verificationStatus === 'verified' 
                      ? 'bg-success' 
                      : user.verificationStatus === 'pending' ?'bg-warning' :'bg-error'
                  }`} />
                  <span className="font-medium text-foreground">
                    {user.verificationStatus === 'verified' 
                      ? 'Verified Professional' 
                      : user.verificationStatus === 'pending' ?'Verification Pending' :'Not Verified'
                    }
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {user.verificationStatus === 'verified' 
                    ? 'Your professional credentials have been verified.' 
                    : user.verificationStatus === 'pending' ?'Your documents are under review. This typically takes 2-3 business days.' :'Submit your professional ID and certifications to get verified.'
                  }
                </p>
                {user.verificationStatus !== 'verified' && (
                  <Button variant="outline" size="sm">
                    <Icon name="Upload" size={16} className="mr-2" />
                    {user.verificationStatus === 'pending' ? 'View Submission' : 'Submit Documents'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalSection;