import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const FloatingActionButton = ({ onClick, className, children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      console.log('Post job clicked');
    }
  };

  const isAuthPage = location.pathname === '/login-register';
  const showOnPages = ['/home-dashboard', '/search-discovery'];
  const shouldShow = !isAuthPage && showOnPages.includes(location.pathname);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 lg:bottom-6 lg:right-6">
      <Button
        onClick={handleClick}
        className={className || "w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-modal transition-all duration-300 hover:scale-105"}
        size="icon"
      >
        {children || <Icon name="Plus" size={24} strokeWidth={2.5} />}
      </Button>
    </div>
  );
};

export default FloatingActionButton;