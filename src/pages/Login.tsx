import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import Swal from 'sweetalert2';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: () => {
      localStorage.setItem('userEmail', email);
      navigate('/');
    },
    onError: (error: any) => {
      Swal.fire('Error', error.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
    }
  });

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/github`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
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
        <div className="flex flex-col w-full items-center justify-center py-md">
          <div className="relative w-full max-w-[420px]">
            {/* Ambient glow behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary-container/20 rounded-2xl blur-xl opacity-50 z-0"></div>
            <div className="relative z-10 w-full bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-lg">
              <div className="mb-lg text-center">
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Welcome back</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Enter your credentials to access your workspace</p>
              </div>

              <form className="flex flex-col gap-md mb-lg" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-sm">
                  <label className="font-body-sm text-body-sm text-on-surface" htmlFor="email">Email Address</label>
                  <div className="relative flex items-center group">
                    <span className="material-symbols-outlined absolute left-sm text-outline group-focus-within:text-primary transition-colors">mail</span>
                    <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] pl-[40px] pr-md text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant" id="email" placeholder="you@devcore.systems" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="flex flex-col gap-sm">
                  <div className="flex justify-between items-center">
                    <label className="font-body-sm text-body-sm text-on-surface" htmlFor="password">Password</label>
                    <Link to="/forgot-password" className="font-body-sm text-body-sm text-primary hover:underline transition-all">Forgot password?</Link>
                  </div>
                  <div className="relative flex items-center group">
                    <span className="material-symbols-outlined absolute left-sm text-outline group-focus-within:text-primary transition-colors">lock</span>
                    <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-[10px] pl-[40px] pr-md text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant tracking-[0.2em]" id="password" placeholder="••••••••••••" required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button className="absolute right-sm text-outline hover:text-on-surface transition-colors" type="button" onClick={() => setShowPassword(!showPassword)}>
                      <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <button className="mt-xs w-full bg-primary hover:bg-primary-fixed text-on-primary font-headline-md text-headline-md !text-[15px] !leading-normal rounded-lg py-sm px-md flex items-center justify-center gap-xs transition-all shadow-md shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98]" type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span> Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex items-center mb-lg">
                <div className="flex-grow border-t border-outline-variant/30"></div>
                <span className="flex-shrink-0 px-md font-body-sm text-body-sm text-outline uppercase tracking-wider">or continue with</span>
                <div className="flex-grow border-t border-outline-variant/30"></div>
              </div>

              <div className="flex gap-md">
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
                Don't have an account?
                <Link className="text-primary hover:text-primary-fixed font-headline-md text-headline-md !text-[13px] !font-medium ml-xs transition-colors" to="/register">Sign up</Link>
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
