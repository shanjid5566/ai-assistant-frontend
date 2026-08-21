import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import Swal from 'sweetalert2';

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: () => {
      localStorage.setItem('userEmail', email);
      navigate('/onboarding/welcome');
    },
    onError: (error: any) => {
      Swal.fire('Error', error.response?.data?.message || 'Registration failed.', 'error');
    }
  });

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/github`;
  };

  const getStrength = (value: string) => {
    let score = 0;
    if (value.length > 0) score++;
    if (value.length > 7) score++;
    if (/[A-Z]/.test(value) && /[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score;
  };

  const score = getStrength(password);
  const colors = ['bg-error', 'bg-tertiary-container', 'bg-primary', 'bg-secondary'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

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
            <div className="relative z-10 w-full bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-lg gap-lg">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col gap-base text-center mb-sm relative z-10">
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Create an account</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Join thousands of developers building on DevCore</p>
              </div>

              <form className="flex flex-col gap-md relative z-10" onSubmit={(e) => {
                e.preventDefault();
                if (password !== confirmPassword) {
                  return Swal.fire('Error', "Passwords do not match", 'error');
                }
                registerMutation.mutate({ firstName, lastName, email, password });
              }}>
              <div className="flex flex-col sm:flex-row gap-md">
                <div className="flex flex-col gap-xs flex-1">
                  <label className="font-body-sm text-body-sm text-on-surface" htmlFor="firstName">First Name</label>
                  <div className="relative flex items-center group">
                    <span className="material-symbols-outlined absolute left-sm text-outline group-focus-within:text-primary transition-colors">badge</span>
                    <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] pl-[40px] pr-md text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant" id="firstName" placeholder="Jane" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                </div>
                <div className="flex flex-col gap-xs flex-1">
                  <label className="font-body-sm text-body-sm text-on-surface" htmlFor="lastName">Last Name</label>
                  <div className="relative flex items-center group">
                    <span className="material-symbols-outlined absolute left-sm text-outline group-focus-within:text-primary transition-colors">badge</span>
                    <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] pl-[40px] pr-md text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant" id="lastName" placeholder="Doe" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-body-sm text-body-sm text-on-surface" htmlFor="email">Email Address</label>
                <div className="relative flex items-center group">
                  <span className="material-symbols-outlined absolute left-sm text-outline group-focus-within:text-primary transition-colors">mail</span>
                  <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] pl-[40px] pr-md text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant" id="email" placeholder="jane@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-body-sm text-body-sm text-on-surface" htmlFor="password">Password</label>
                <div className="relative flex items-center group">
                  <span className="material-symbols-outlined absolute left-sm text-outline group-focus-within:text-primary transition-colors">lock</span>
                  <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] pl-[40px] pr-xl text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant tracking-[0.2em]" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type={showPassword ? "text" : "password"} />
                  <button className="absolute right-sm text-outline hover:text-on-surface transition-colors focus:outline-none flex items-center justify-center p-xs rounded" onClick={() => setShowPassword(!showPassword)} type="button">
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                
                <div className="flex gap-xs mt-xs h-1 w-full" id="strengthBar">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${i < score ? colors[score - 1] : 'bg-surface-container-highest'}`}></div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-xs">
                  <span className={`font-label-caps text-label-caps ${score > 0 ? `text-${colors[score - 1].replace('bg-', '')}` : 'text-outline'}`}>
                    {score > 0 ? labels[score - 1] : 'Password Strength'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-body-sm text-body-sm text-on-surface" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative flex items-center group">
                  <span className="material-symbols-outlined absolute left-sm text-outline group-focus-within:text-primary transition-colors">lock</span>
                  <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] pl-[40px] pr-xl text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant tracking-[0.2em]" id="confirmPassword" placeholder="••••••••" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  <button className="absolute right-sm text-outline hover:text-on-surface transition-colors focus:outline-none flex items-center justify-center p-xs rounded" onClick={() => setShowConfirmPassword(!showConfirmPassword)} type="button">
                    <span className="material-symbols-outlined text-[18px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button className="w-full mt-sm py-sm px-md bg-primary hover:bg-primary-fixed-dim text-on-primary font-body-md text-body-md font-semibold rounded-lg transition-colors flex items-center justify-center gap-sm" type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span> Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-md relative z-10">
              <div className="flex-1 h-[1px] bg-surface-container-highest"></div>
              <span className="font-body-sm text-body-sm text-outline uppercase tracking-wider">or continue with email</span>
              <div className="flex-1 h-[1px] bg-surface-container-highest"></div>
            </div>

            <div className="flex gap-md relative z-10">
              <button 
                type="button" 
                onClick={handleGoogleLogin}
                className="flex-1 flex items-center justify-center gap-sm py-[10px] px-md rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/50 text-on-surface font-body-md text-body-md group">
                <svg className="w-5 h-5 text-on-surface group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Google
              </button>
              <button 
                type="button" 
                onClick={handleGithubLogin}
                className="flex-1 flex items-center justify-center gap-sm py-[10px] px-md rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/50 text-on-surface font-body-md text-body-md group">
                <svg className="w-5 h-5 text-on-surface group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" fillRule="evenodd"></path>
                </svg>
                GitHub
              </button>
            </div>
          </div>
          
          <div className="mt-lg text-center relative z-10">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Already have an account? 
              <Link className="text-primary hover:text-primary-fixed font-headline-md text-headline-md !text-[13px] !font-medium ml-xs transition-colors" to="/login">Log in</Link>
            </p>
          </div>
        </div>
        </div>
      </main>

      <footer className="w-full py-md px-lg flex flex-col items-center gap-md">
        <nav className="flex gap-lg items-center">
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Support</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms of Service</a>
        </nav>
        <p className="font-label-caps text-label-caps text-outline uppercase">© 2024 DevCore Systems Inc.</p>
      </footer>
    </div>
  );
}
