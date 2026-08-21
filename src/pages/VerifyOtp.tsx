import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import Swal from 'sweetalert2';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on load
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { email: string, otp: string }) => {
      const response = await api.post('/auth/verify-otp', data);
      return response.data;
    },
    onSuccess: () => {
      const otpValue = otp.join('');
      if (location.state?.purpose === 'reset-password') {
        navigate('/reset-password', { state: { email: location.state?.email, otp: otpValue } });
      } else {
        navigate('/onboarding/welcome');
      }
    },
    onError: (error: any) => {
      Swal.fire('Error', error.response?.data?.message || 'Invalid OTP.', 'error');
    }
  });

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if current field is filled
    if (value !== '' && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      Swal.fire('Warning', 'Please enter all 6 digits', 'warning');
      return;
    }
    
    const email = location.state?.email;
    if (!email) {
      Swal.fire('Error', 'Email not found. Please try again.', 'error');
      navigate('/forgot-password');
      return;
    }
    
    verifyOtpMutation.mutate({ email, otp: otpValue });
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
            {/* Ambient glow behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary-container/20 rounded-2xl blur-xl opacity-50 z-0"></div>
            <div className="relative z-10 w-full bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-xl gap-lg">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col gap-base text-center mb-sm relative z-10">
                <div className="w-16 h-16 bg-surface-container-low border border-outline-variant/30 rounded-full flex items-center justify-center mx-auto mb-xs">
                  <span className="material-symbols-outlined text-primary text-[32px]">mark_email_read</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Verify your email</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">We've sent a 6-digit verification code to your email address to verify your identity.</p>
              </div>

              <form onSubmit={handleVerify} className="flex flex-col gap-xl relative z-10">
                <div className="flex justify-between gap-sm">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 md:w-14 md:h-16 text-center font-headline-md text-headline-md bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                    />
                  ))}
                </div>

                <button type="submit" disabled={verifyOtpMutation.isPending} className="w-full bg-primary hover:bg-primary-fixed text-on-primary font-headline-sm text-headline-sm !text-[16px] rounded-lg py-sm transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-[0.98] flex items-center justify-center gap-xs">
                  {verifyOtpMutation.isPending ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </button>
                
                <div className="text-center font-body-sm text-body-sm text-on-surface-variant">
                  Didn't receive the code?{' '}
                  <button type="button" className="text-primary font-medium hover:underline focus:outline-none">
                    Resend OTP
                  </button>
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
