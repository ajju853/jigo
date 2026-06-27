import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User as UserIcon, Lock, Bell } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useToastStore from '../stores/toastStore';
import { profileAPI } from '../api/client';
import ProfileForm from '../components/forms/ProfileForm';
import Tabs from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

export const SettingsPage = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState('profile');

  const isJigolo = user?.role === 'jigolo';
  const { data, isLoading } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      if (!isJigolo) return null;
      const response = await profileAPI.browse();
      const result = response.data || response;
      return (Array.isArray(result) ? result : (result.profiles || [])).find(p => p.userId === user.id) || null;
    },
    enabled: !!user && isJigolo,
  });

  const profile = data;

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const handleNotificationChange = (type) => {
    setNotificationSettings(prev => ({ ...prev, [type]: !prev[type] }));
    addToast("Notification preferences updated.", "info");
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    addToast("Password changed successfully (Mock).", "success");
    e.target.reset();
  };

  const tabs = [
    { id: 'profile', label: 'Profile Details', icon: UserIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Password', icon: Lock },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner className="w-8 h-8 text-brandIndigo" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-xs sm:text-sm">Manage your account profile, preferences, and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card hoverable={false} className="p-2 border border-white/5">
            <div className="flex flex-col">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide text-left transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-brandIndigo/20 to-brandPurple/20 border-l-4 border-brandIndigo text-white font-bold'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <main className="lg:col-span-3">
          <Card hoverable={false} className="border border-white/5 p-6 bg-white/5">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <h2 className="text-lg font-heading font-bold text-white">Personal Information</h2>
                  <p className="text-xs text-slate-400 mt-1">Configure your personal information visible to Jigo users.</p>
                </div>
                <ProfileForm profile={profile} />
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <h2 className="text-lg font-heading font-bold text-white">Notification Preferences</h2>
                  <p className="text-xs text-slate-400 mt-1">Select where you want to be notified of bookings and chats.</p>
                </div>
                <div className="space-y-4 max-w-md">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive confirmations, invoices, and messaging alerts.' },
                    { key: 'sms', label: 'SMS Notifications', desc: 'Receive instant booking alert SMS on your mobile phone.' },
                    { key: 'push', label: 'In-App Push Alerts', desc: 'Receive real-time chat notifications directly in browser tab.' },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/8">
                      <div>
                        <h4 className="text-xs font-semibold text-white">{label}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings[key]}
                        onChange={() => handleNotificationChange(key)}
                        className="w-4 h-4 rounded text-brandIndigo bg-transparent border-white/20 focus:ring-brandIndigo/50"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <h2 className="text-lg font-heading font-bold text-white">Security & Password</h2>
                  <p className="text-xs text-slate-400 mt-1">Configure credentials and session settings.</p>
                </div>
                <form onSubmit={handlePasswordReset} className="space-y-4 max-w-md">
                  <Input label="Current Password" type="password" required />
                  <Input label="New Password" type="password" required />
                  <Input label="Confirm New Password" type="password" required />
                  <Button type="submit" variant="primary" className="mt-4">Change Password</Button>
                </form>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
