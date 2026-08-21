import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import Swal from 'sweetalert2';

export default function AiPreference() {
  const [experience, setExperience] = useState('MID_LEVEL');
  const [architecture, setArchitecture] = useState('mvc');
  const navigate = useNavigate();
  const location = useLocation();

  const onboardingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/users/onboarding', data);
      return response.data;
    },
    onSuccess: () => {
      navigate('/');
    },
    onError: (error: any) => {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save onboarding data.', 'error');
    }
  });

  const handleComplete = () => {
    const devType = location.state?.devType || 'web';
    const techStack = location.state?.techStack || [];
    const email = localStorage.getItem('userEmail');
    if (!email) {
      Swal.fire('Error', 'User email not found. Please log in again.', 'error');
      navigate('/login');
      return;
    }
    
    onboardingMutation.mutate({
      email,
      domainFocus: devType.toUpperCase() === 'APP' ? 'MOBILE' : 'WEB',
      preferredStack: techStack,
      experienceLevel: experience,
      architecture: architecture
    });
  };

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col items-center">
      <header className="w-full flex items-center justify-between px-xl py-lg absolute top-0 left-0 z-50 pointer-events-none">
        <div className="flex items-center gap-sm pointer-events-auto">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[20px]">terminal</span>
          </div>
          <span className="font-headline-md text-body-md tracking-tight text-on-surface">DEV_CORE</span>
        </div>
      </header>

      <main className="w-full flex-grow flex items-center justify-center py-lg md:py-xl px-sm md:px-lg">
        <div className="flex flex-col w-full max-w-3xl px-4 md:px-8 mx-auto space-y-12 pb-24 relative pt-8">
          <div className="w-full flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full shadow-md z-20">
              <div className="w-2 h-2 rounded-full bg-primary/40"></div>
              <div className="w-2 h-2 rounded-full bg-primary/40"></div>
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(173,198,255,0.6)]"></div>
            </div>
          </div>

          <div className="w-full text-center space-y-4 pt-12 relative">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
            <h1 className="text-headline-sm md:text-headline-lg font-headline-sm md:font-headline-lg tracking-tight text-on-surface">How should the AI assist you?</h1>
            <p className="text-body-sm md:text-body-md font-body-sm md:font-body-md text-on-surface-variant max-w-[576px] w-full mx-auto">
              Customize the AI's coding style and output to match your expertise and preferred project structure.
            </p>
          </div>

          <div className="space-y-6 relative z-10 mt-8">
            <h2 className="text-headline-sm md:text-headline-md font-headline-sm md:font-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">school</span>
              Experience Level
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <label className="group relative cursor-pointer">
                <input className="peer sr-only" name="experience" type="radio" value="BEGINNER" checked={experience === 'BEGINNER'} onChange={() => setExperience('BEGINNER')} />
                <div className="p-4 md:p-6 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors flex items-start gap-4 peer-checked:bg-primary/5 peer-checked:shadow-[inset_0_0_0_2px_#adc6ff]">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 group-hover:bg-primary/20 peer-checked:bg-primary peer-checked:text-on-primary transition-colors text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">local_florist</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    <h3 className="text-body-md font-headline-md text-on-surface peer-checked:text-primary">Beginner</h3>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">Explain code step-by-step with detailed comments and fundamental concepts.</p>
                  </div>
                  <div className="ml-auto w-5 h-5 rounded-full border-2 border-outline-variant flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-on-primary opacity-0 peer-checked:opacity-100"></div>
                  </div>
                </div>
              </label>

              <label className="group relative cursor-pointer">
                <input className="peer sr-only" name="experience" type="radio" value="MID_LEVEL" checked={experience === 'MID_LEVEL'} onChange={() => setExperience('MID_LEVEL')} />
                <div className="p-4 md:p-6 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors flex items-start gap-4 peer-checked:bg-primary/5 peer-checked:shadow-[inset_0_0_0_2px_#adc6ff]">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 group-hover:bg-primary/20 peer-checked:bg-primary peer-checked:text-on-primary transition-colors text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">psychology</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    <h3 className="text-body-md font-headline-md text-on-surface peer-checked:text-primary">Mid-Level</h3>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">Standard explanations focusing on best practices and implementation details.</p>
                  </div>
                  <div className="ml-auto w-5 h-5 rounded-full border-2 border-outline-variant flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-on-primary opacity-0 peer-checked:opacity-100"></div>
                  </div>
                </div>
              </label>

              <label className="group relative cursor-pointer">
                <input className="peer sr-only" name="experience" type="radio" value="SENIOR" checked={experience === 'SENIOR'} onChange={() => setExperience('SENIOR')} />
                <div className="p-4 md:p-6 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors flex items-start gap-4 peer-checked:bg-primary/5 peer-checked:shadow-[inset_0_0_0_2px_#adc6ff]">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 group-hover:bg-primary/20 peer-checked:bg-primary peer-checked:text-on-primary transition-colors text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    <h3 className="text-body-md font-headline-md text-on-surface peer-checked:text-primary">Senior</h3>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">Concise, highly optimized code delivery without basic theoretical explanations.</p>
                  </div>
                  <div className="ml-auto w-5 h-5 rounded-full border-2 border-outline-variant flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-on-primary opacity-0 peer-checked:opacity-100"></div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <h2 className="text-headline-sm md:text-headline-md font-headline-sm md:font-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-container text-[20px]">architecture</span>
              Architecture Preference
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="group relative cursor-pointer">
                <input className="peer sr-only" name="architecture" type="radio" value="mvc" checked={architecture === 'mvc'} onChange={() => setArchitecture('mvc')} />
                <div className="h-full p-4 md:p-5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col items-center text-center peer-checked:bg-tertiary-container/10 peer-checked:shadow-[inset_0_0_0_2px_#df7412]">
                  <div className="w-full h-32 mb-4 rounded bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-tertiary/10 to-transparent"></div>
                    <div className="flex flex-col gap-2 w-full z-10">
                      <div className="w-full h-4 bg-surface rounded-sm border border-outline-variant/50"></div>
                      <div className="flex gap-2 w-full">
                        <div className="w-1/2 h-8 bg-surface rounded-sm border border-outline-variant/50"></div>
                        <div className="w-1/2 h-8 bg-surface rounded-sm border border-outline-variant/50"></div>
                      </div>
                      <div className="w-full h-4 bg-surface rounded-sm border border-outline-variant/50"></div>
                    </div>
                  </div>
                  <span className="text-body-md font-headline-md text-on-surface peer-checked:text-tertiary-fixed-dim">MVC</span>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-2">Model, View, Controller</p>
                </div>
              </label>

              <label className="group relative cursor-pointer">
                <input className="peer sr-only" name="architecture" type="radio" value="clean" checked={architecture === 'clean'} onChange={() => setArchitecture('clean')} />
                <div className="h-full p-4 md:p-5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col items-center text-center peer-checked:bg-tertiary-container/10 peer-checked:shadow-[inset_0_0_0_2px_#df7412]">
                  <div className="w-full h-32 mb-4 rounded bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-tertiary/10 to-transparent"></div>
                    <div className="w-16 h-16 rounded-full border-4 border-surface border-t-tertiary/50 border-l-tertiary/50 animate-[spin_10s_linear_infinite] flex items-center justify-center z-10 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-surface border border-outline-variant/30"></div>
                    </div>
                  </div>
                  <span className="text-body-md font-headline-md text-on-surface peer-checked:text-tertiary-fixed-dim">Clean Architecture</span>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-2">Domain-driven, decoupled layers</p>
                </div>
              </label>

              <label className="group relative cursor-pointer">
                <input className="peer sr-only" name="architecture" type="radio" value="t3" checked={architecture === 't3'} onChange={() => setArchitecture('t3')} />
                <div className="h-full p-4 md:p-5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col items-center text-center peer-checked:bg-tertiary-container/10 peer-checked:shadow-[inset_0_0_0_2px_#df7412]">
                  <div className="w-full h-32 mb-4 rounded bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-tertiary/10 to-transparent"></div>
                    <div className="grid grid-cols-2 gap-2 w-full h-full z-10 py-2">
                      <div className="bg-surface rounded-sm border border-outline-variant/50 col-span-2 h-6"></div>
                      <div className="bg-surface rounded-sm border border-outline-variant/50 row-span-2"></div>
                      <div className="bg-surface rounded-sm border border-outline-variant/50 h-6"></div>
                      <div className="bg-surface rounded-sm border border-outline-variant/50 h-6"></div>
                    </div>
                  </div>
                  <span className="text-body-md font-headline-md text-on-surface peer-checked:text-tertiary-fixed-dim">T3 Stack</span>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-2">Next.js, tRPC, Tailwind</p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-8 flex flex-col-reverse sm:flex-row items-center justify-between mt-12 relative z-10 before:absolute before:top-0 before:left-0 before:w-full before:h-px before:bg-gradient-to-r before:from-transparent before:via-outline-variant/30 before:to-transparent gap-4 sm:gap-0">
            <button onClick={() => navigate(-1)} className="w-full sm:w-auto justify-center px-6 py-3 rounded-lg text-body-md font-headline-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
            <div className="flex gap-4 items-center w-full sm:w-auto">
              <button disabled={onboardingMutation.isPending} onClick={handleComplete} className="group w-full sm:w-auto justify-center px-8 py-4 rounded-lg bg-primary text-on-primary text-body-md font-headline-md hover:bg-primary-fixed-dim transition-all shadow-lg shadow-primary/20 flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
                {onboardingMutation.isPending ? 'Launching...' : 'Complete Setup'}
                {!onboardingMutation.isPending && (
                  <span className="material-symbols-outlined text-[20px] group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform">rocket_launch</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
