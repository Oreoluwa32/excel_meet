import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const BottomTabNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    {
      label: 'Home',
      path: '/home-dashboard',
      icon: 'Home',
      badge: 0
    },
    {
      label: 'Search',
      path: '/search-discovery',
      icon: 'Search',
      badge: 0
    },
    {
      label: 'Profile',
      path: '/user-profile-management',
      icon: 'User',
      badge: 0
    }
  ];

  const handleTabClick = (path) => {
    navigate(path);
  };

  const isAuthPage = location.pathname === '/login-register';

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border lg:hidden">
        <div className="flex items-center justify-around h-16 px-4">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            
            return (
              <button
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                className={`flex flex-col items-center justify-center space-y-1 min-w-0 flex-1 py-2 px-1 transition-colors duration-200 ${
                  isActive 
                    ? 'text-primary' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon 
                    name={tab.icon} 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {tab.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-error text-error-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium truncate ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Top Navigation */}
      <nav className="hidden lg:block fixed top-16 left-0 right-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-center h-12 px-6">
          <div className="flex items-center space-x-8">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              
              return (
                <button
                  key={tab.path}
                  onClick={() => handleTabClick(tab.path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isActive 
                      ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="relative">
                    <Icon 
                      name={tab.icon} 
                      size={18} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {tab.badge > 0 && (
                      <span className="absolute -top-2 -right-2 bg-error text-error-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomTabNavigation;