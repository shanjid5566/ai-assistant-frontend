import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import Swal from 'sweetalert2';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { email: string, otp: string, newPassword: string }) => {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    },
    onSuccess: () => {
      Swal.fire('Success', 'Password reset successful. You can now login.', 'success');
      navigate('/login');
    },
    onError: (error: any) => {
      Swal.fire('Error', error.response?.data?.message || 'Failed to reset password.', 'error');
    }
  });

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if(password !== confirmPassword) {
        Swal.fire('Error', "Passwords do not match", 'error');
        return;
    }
    
    const email = location.state?.email;
    const otp = location.state?.otp;
    
    if (!email || !otp) {
        Swal.fire('Error', "Missing email or OTP. Please restart the reset process.", 'error');
        navigate('/forgot-password');
        return;
    }
    
    resetPasswordMutation.mutate({ email, otp, newPassword: password });
  };

  return (
    <div className="bg-surface-container-lowest font-body-md text-on-surface min-h-screen flex flex-col items-center justify-between">
      <header className="w-full py-md px-lg flex flex-col items-center gap-sm">
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">terminal</span>
          </div>
          <span className="font-headline-md text-headline-md tracking-tight text-on-surface">DevCore</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center w-full px-lg">
        <div className="flex flex-col w-full items-center justify-center px-md py-md">
          <div className="relative w-full max-w-[480px]">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary-container/20 rounded-2xl blur-xl opacity-50 z-0"></div>
            <div className="relative z-10 w-full bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-xl gap-lg">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col gap-base text-center mb-sm relative z-10">
                <div className="w-16 h-16 bg-surface-container-low border border-outline-variant/30 rounded-full flex items-center justify-center mx-auto mb-xs">
                  <span className="material-symbols-outlined text-primary text-[32px]">key</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Reset Password</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Enter your new password below.</p>
              </div>

              <form onSubmit={handleReset} className="flex flex-col gap-xl relative z-10">
                <div className="flex flex-col gap-md">
                    <div className="flex flex-col gap-xs">
                    <label className="font-body-sm text-body-sm text-on-surface" htmlFor="password">New Password</label>
                    <div className="relative flex items-center group">
                        <span className="material-symbols-outlined absolute left-sm text-outline group-focus-within:text-primary transition-colors">lock</span>
                        <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] pl-[40px] pr-xl text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant tracking-[0.2em]" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type={showPassword ? "text" : "password"} required minLength={8} />
                        <button className="absolute right-sm text-outline hover:text-on-surface transition-colors focus:outline-none flex items-center justify-center p-xs rounded" onClick={() => setShowPassword(!showPassword)} type="button">
                        <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                    </div>
                    <div className="flex flex-col gap-xs">
                    <label className="font-body-sm text-body-sm text-on-surface" htmlFor="confirmPassword">Confirm Password</label>
                    <div className="relative flex items-center group">
                        <span className="material-symbols-outlined absolute left-sm text-outline group-focus-within:text-primary transition-colors">lock</span>
                        <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] pl-[40px] pr-xl text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant tracking-[0.2em]" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" type={showConfirmPassword ? "text" : "password"} required minLength={8} />
                        <button className="absolute right-sm text-outline hover:text-on-surface transition-colors focus:outline-none flex items-center justify-center p-xs rounded" onClick={() => setShowConfirmPassword(!showConfirmPassword)} type="button">
                        <span className="material-symbols-outlined text-[18px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                    </div>
                </div>

                <button type="submit" disabled={resetPasswordMutation.isPending} className="w-full bg-primary hover:bg-primary-fixed text-on-primary font-headline-sm text-headline-sm !text-[16px] rounded-lg py-sm transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-[0.98] flex items-center justify-center gap-xs">
                  {resetPasswordMutation.isPending ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-md px-lg flex justify-center border-t border-outline-variant/30">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          &copy; {new Date().getFullYear()} DevCore Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
