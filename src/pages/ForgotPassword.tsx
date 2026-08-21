import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import Swal from 'sweetalert2';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const sendOtpMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await api.post('/auth/send-otp', data);
      return response.data;
    },
    onSuccess: () => {
      navigate('/verify-otp', { state: { purpose: 'reset-password', email } });
    },
    onError: (error: any) => {
      Swal.fire('Error', error.response?.data?.message || 'Failed to send OTP.', 'error');
    }
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    sendOtpMutation.mutate({ email });
  };

  return (
    <div className="bg-surface-container-lowest font-body-md text-on-surface min-h-screen flex flex-col items-center justify-between">
      <header className="w-full py-md px-lg flex flex-col items-center gap-sm">
        <Link to="/" className="flex items-center gap-sm hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">terminal</span>
          </div>
          <span className="font-headline-md text-headline-md tracking-tight text-on-surface">DevCore</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center w-full px-lg">
        <div className="flex flex-col w-full items-center justify-center px-md py-md">
          <div className="relative w-full max-w-[480px]">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary-container/20 rounded-2xl blur-xl opacity-50 z-0"></div>
            <div className="relative z-10 w-full bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-xl gap-lg">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col gap-base text-center mb-sm relative z-10">
                <div className="w-16 h-16 bg-surface-container-low border border-outline-variant/30 rounded-full flex items-center justify-center mx-auto mb-xs">
                  <span className="material-symbols-outlined text-primary text-[32px]">lock_reset</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Forgot Password?</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">No worries! Enter your email address below and we'll send you an OTP to reset it.</p>
              </div>

              <form onSubmit={handleSendOtp} className="flex flex-col gap-xl relative z-10">
                <div className="flex flex-col gap-xs">
                  <label className="font-body-sm text-body-sm text-on-surface" htmlFor="email">Email Address</label>
                  <div className="relative flex items-center group">
                    <span className="material-symbols-outlined absolute left-sm text-outline group-focus-within:text-primary transition-colors">mail</span>
                    <input required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] pl-[40px] pr-md text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant" id="email" placeholder="jane@example.com" type="email" />
                  </div>
                </div>

                <button type="submit" disabled={sendOtpMutation.isPending} className="w-full bg-primary hover:bg-primary-fixed text-on-primary font-headline-sm text-headline-sm !text-[16px] rounded-lg py-sm transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-[0.98] flex items-center justify-center gap-xs">
                  {sendOtpMutation.isPending ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
                
                <div className="text-center font-body-sm text-body-sm text-on-surface-variant">
                  Remember your password?{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline focus:outline-none">
                    Log in
                  </Link>
                </div>
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
