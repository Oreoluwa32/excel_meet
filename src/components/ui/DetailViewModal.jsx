import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const DetailViewModal = ({ children, isOpen, onClose, title }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const detailRoutes = ['/job-details', '/professional-profile', '/job-applications'];
  const isDetailRoute = detailRoutes.includes(location.pathname);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && (isOpen || isDetailRoute)) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDetailRoute]);

  useEffect(() => {
    if (isOpen || isDetailRoute) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isDetailRoute]);

  const handleClose = () => {
    if (isDetailRoute) {
      navigate(-1);
    } else if (onClose) {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen && !isDetailRoute) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Mobile: Full Screen */}
      <div className="lg:hidden fixed inset-0 bg-background">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          {title && (
            <h2 className="text-lg font-semibold text-foreground truncate mx-4">
              {title}
            </h2>
          )}
          <div className="w-10" />
        </div>
        
        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Desktop: Centered Modal */}
      <div className="hidden lg:flex items-center justify-center min-h-screen p-6">
        <div 
          className="bg-card rounded-lg shadow-modal max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Desktop Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            {title && (
              <h2 className="text-xl font-semibold text-foreground">
                {title}
              </h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="ml-auto"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
          
          {/* Desktop Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailViewModal;