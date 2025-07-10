import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AccountSettingsSection = ({ user, onSave }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settings, setSettings] = useState({
    language: user.settings?.language || 'en',
    emailNotifications: user.settings?.emailNotifications || true,
    pushNotifications: user.settings?.pushNotifications || true,
    smsNotifications: user.settings?.smsNotifications || false,
    jobAlerts: user.settings?.jobAlerts || true,
    promotionalEmails: user.settings?.promotionalEmails || false
  });

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ];

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordSave = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSave('password', passwordData);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
  };

  const handleSettingsSave = () => {
    onSave('settings', settings);
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon name="Settings" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Account Settings</h3>
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
            {/* Password Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Password</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                >
                  {isChangingPassword ? 'Cancel' : 'Change Password'}
                </Button>
              </div>

              {isChangingPassword && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    required
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    required
                  />
                  <Button onClick={handlePasswordSave} size="sm">
                    Update Password
                  </Button>
                </div>
              )}
            </div>

            {/* Language Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Language & Region</h4>
              <Select
                label="Language"
                options={languageOptions}
                value={settings.language}
                onChange={(value) => handleSettingChange('language', value)}
              />
            </div>

            {/* Notification Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Notification Preferences</h4>
              <div className="space-y-3">
                <Checkbox
                  label="Email notifications"
                  description="Receive notifications via email"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                />
                <Checkbox
                  label="Push notifications"
                  description="Receive push notifications in browser"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                />
                <Checkbox
                  label="SMS notifications"
                  description="Receive notifications via SMS"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                />
                <Checkbox
                  label="Job alerts"
                  description="Get notified about new job opportunities"
                  checked={settings.jobAlerts}
                  onChange={(e) => handleSettingChange('jobAlerts', e.target.checked)}
                />
                <Checkbox
                  label="Promotional emails"
                  description="Receive promotional offers and updates"
                  checked={settings.promotionalEmails}
                  onChange={(e) => handleSettingChange('promotionalEmails', e.target.checked)}
                />
              </div>
            </div>

            <Button onClick={handleSettingsSave} className="mt-6">
              Save Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettingsSection;