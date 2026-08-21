import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import Swal from 'sweetalert2';

export default function Profile() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [domainFocus, setDomainFocus] = useState('WEB');
  const [preferredStack, setPreferredStack] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('MID_LEVEL');
  const [architecture, setArchitecture] = useState('mvc');

  const queryClient = useQueryClient();

  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const email = localStorage.getItem('userEmail');
      if (!email) return {};
      const response = await api.get(`/users/me?email=${email}`);
      return response.data?.user || response.data?.data || {};
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const email = localStorage.getItem('userEmail');
      if (!email) throw new Error('User not logged in');
      const payload = { ...data, email };
      const response = await api.post('/auth/change-password', payload);
      return response.data;
    },
    onSuccess: () => {
      Swal.fire('Success', "Password updated successfully!", 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      Swal.fire('Error', error.response?.data?.message || 'Failed to update password.', 'error');
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      const email = localStorage.getItem('userEmail');
      if (!email) throw new Error('User not logged in');
      const response = await api.patch('/users/me', { ...data, email });
      return response.data;
    },
    onSuccess: () => {
      Swal.fire('Success', 'Preferences Saved!', 'success');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      Swal.fire('Error', error.response?.data?.message || 'Failed to update preferences.', 'error');
    }
  });

  useEffect(() => {
    if (userProfile) {
      setDomainFocus(userProfile.domainFocus || 'WEB');
      setPreferredStack(userProfile.preferredStack?.join(', ') || '');
      setExperienceLevel(userProfile.experienceLevel || 'MID_LEVEL');
      setArchitecture(userProfile.architecture || 'mvc');
    }
  }, [userProfile]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire('Error', "Passwords don't match!", 'error');
      return;
    }
    updatePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate({
      domainFocus,
      preferredStack: preferredStack.split(',').map(s => s.trim()).filter(Boolean),
      experienceLevel,
      architecture
    });
  };

  return (
    <div className="bg-surface-container-lowest font-body-md text-on-surface min-h-screen flex flex-col items-center justify-between">
      {/* Header */}
      <header className="w-full py-md px-lg flex items-center justify-between z-10 relative bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">terminal</span>
          </div>
          <span className="font-headline-md text-headline-md tracking-tight text-on-surface">DevCore</span>
        </div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group px-md py-sm rounded-lg hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-body-md text-body-md font-medium">Back to Workspace</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-lg py-xl">
        
        <div className="w-full max-w-4xl text-center mb-xl relative z-10">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Profile Settings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage your account information and security</p>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-lg relative">
          
          {/* User Info Card */}
          <div className="md:col-span-1 relative flex flex-col">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl opacity-50 z-0"></div>
            <div className="relative z-10 w-full bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-lg items-center h-full">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary-container flex items-center justify-center shadow-lg mb-md relative overflow-hidden group">
                <span className="material-symbols-outlined text-[48px] text-on-primary">person</span>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="material-symbols-outlined text-white">photo_camera</span>
                </div>
              </div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
                {isProfileLoading ? 'Loading...' : (userProfile?.name || 'DevUser')}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">
                {isProfileLoading ? 'Loading...' : (userProfile?.email || 'devuser@example.com')}
              </p>
            </div>
          </div>

          {/* Security Card */}
          <div className="md:col-span-2 relative flex flex-col">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary-container/20 rounded-2xl blur-xl opacity-50 z-0"></div>
            <div className="relative z-10 w-full bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-xl h-full">
              
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">lock</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-medium">Change Password</h3>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-xl">Ensure your account is using a long, random password to stay secure.</p>
              
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-md">
                
                <div className="flex flex-col gap-sm">
                  <label className="font-body-sm text-body-sm text-on-surface">Current Password</label>
                  <div className="relative flex items-center group">
                    <span className="material-symbols-outlined absolute left-sm text-outline group-focus-within:text-primary transition-colors">key</span>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••" 
                      className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] pl-[40px] pr-md text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant tracking-[0.2em]"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-sm">
                  <label className="font-body-sm text-body-sm text-on-surface">New Password</label>
                  <div className="relative flex items-center group">
                    <span className="material-symbols-outlined absolute left-sm text-outline group-focus-within:text-primary transition-colors">password</span>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••" 
                      className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] pl-[40px] pr-md text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant tracking-[0.2em]"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-sm mb-sm">
                  <label className="font-body-sm text-body-sm text-on-surface">Confirm New Password</label>
                  <div className="relative flex items-center group">
                    <span className="material-symbols-outlined absolute left-sm text-outline group-focus-within:text-primary transition-colors">password</span>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••" 
                      className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] pl-[40px] pr-md text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant tracking-[0.2em]"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="mt-md flex justify-end">
                  <button 
                    type="submit" 
                    disabled={updatePasswordMutation.isPending}
                    className="bg-primary hover:bg-primary-fixed text-on-primary font-headline-md text-headline-md !text-[15px] !leading-normal rounded-lg py-sm px-xl flex items-center justify-center gap-xs transition-all shadow-md shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {updatePasswordMutation.isPending ? 'sync' : 'save'}
                    </span>
                    {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* AI & Tech Stack Preferences */}
        <div className="w-full max-w-4xl mt-lg relative z-10">
          <div className="absolute -inset-1 bg-gradient-to-tr from-secondary-container/20 to-primary/20 rounded-2xl blur-xl opacity-50 z-0"></div>
          <div className="relative z-10 w-full bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-xl">
            
            <div className="flex items-center gap-sm mb-lg border-b border-outline-variant/30 pb-md">
              <span className="material-symbols-outlined text-primary text-[24px]">magic_button</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-medium">AI Generation Preferences</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              {/* Domain & Stack */}
              <div className="flex flex-col gap-md">
                <div className="flex flex-col gap-sm">
                  <label className="font-body-sm text-body-sm text-on-surface font-medium">Primary Domain</label>
                  <select value={domainFocus} onChange={e => setDomainFocus(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] px-md text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
                    <option value="WEB">Web Development</option>
                    <option value="MOBILE">Mobile App</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-sm">
                  <label className="font-body-sm text-body-sm text-on-surface font-medium">Preferred Tech Stack</label>
                  <input type="text" value={preferredStack} onChange={e => setPreferredStack(e.target.value)} placeholder="e.g. React, Python, Django" className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] px-md text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant" />
                  <p className="text-body-xs text-on-surface-variant mt-1">Comma separated technologies (e.g. Next.js, Tailwind, Prisma)</p>
                </div>
              </div>

              {/* Experience & Architecture */}
              <div className="flex flex-col gap-md">
                <div className="flex flex-col gap-sm">
                  <label className="font-body-sm text-body-sm text-on-surface font-medium">Experience Level</label>
                  <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] px-md text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
                    <option value="BEGINNER">Beginner (Detailed explanations)</option>
                    <option value="MID_LEVEL">Intermediate (Standard code)</option>
                    <option value="SENIOR">Expert (Concise, advanced patterns)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-sm">
                  <label className="font-body-sm text-body-sm text-on-surface font-medium">Architecture Pattern</label>
                  <select value={architecture} onChange={e => setArchitecture(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] px-md text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
                    <option value="mvc">MVC (Model-View-Controller)</option>
                    <option value="clean">Clean Architecture</option>
                    <option value="t3">T3 Stack (Next.js/TRPC)</option>
                    <option value="modular">Modular/Monorepo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-xl flex justify-end">
              <button 
                type="button" 
                onClick={handleSavePreferences}
                disabled={updatePreferencesMutation.isPending}
                className="bg-surface-container hover:bg-surface-container-high text-on-surface font-headline-md text-headline-md !text-[15px] !leading-normal rounded-lg py-sm px-xl flex items-center justify-center gap-xs transition-all border border-outline-variant/30 active:scale-[0.98] disabled:opacity-70"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {updatePreferencesMutation.isPending ? 'sync' : 'update'}
                </span>
                {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
            
          </div>
        </div>

      </main>
    </div>
  );
}
