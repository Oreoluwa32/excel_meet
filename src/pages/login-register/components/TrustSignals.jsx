import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex flex-col items-center space-y-4">
        {/* SSL Certificate Badge */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Shield" size={16} className="text-success" />
          <span>SSL Secured Connection</span>
        </div>
        
        {/* Trust Indicators */}
        <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="Lock" size={14} className="text-success" />
            <span>256-bit Encryption</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Icon name="CheckCircle" size={14} className="text-success" />
            <span>Verified Platform</span>
          </div>
        </div>
        
        {/* Footer Links */}
        <div className="flex items-center justify-center space-x-4 text-xs">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </button>
          <span className="text-border">•</span>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </button>
          <span className="text-border">•</span>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            Help Center
          </button>
        </div>
        
        {/* Copyright */}
        <div className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Excel-meet. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;