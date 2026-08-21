import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingWelcome() {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col items-center">
      <header className="w-full flex items-center justify-between px-md md:px-xl py-md md:py-lg absolute top-0 left-0 z-50 pointer-events-none">
        <div className="flex items-center gap-sm pointer-events-auto">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[20px]">terminal</span>
          </div>
          <span className="font-headline-md text-body-md tracking-tight text-on-surface">DEV_CORE</span>
        </div>
      </header>

      <main className="w-full flex-grow flex items-center justify-center py-lg md:py-xl px-sm md:px-lg">
        <div className="flex flex-col w-full items-center justify-center min-h-[calc(100vh-140px)] relative">
          <div className="w-full flex justify-center mb-6 pt-4">
            <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full shadow-md">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(173,198,255,0.6)]"></div>
              <div className="w-2 h-2 rounded-full bg-surface-variant"></div>
              <div className="w-2 h-2 rounded-full bg-surface-variant"></div>
            </div>
          </div>
          <div className="max-w-container-max w-full flex flex-col items-center pt-8">
            <div className="text-center mb-lg md:mb-xl px-sm">
              <h1 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-background mb-sm">Welcome! Let's personalize your workspace.</h1>
              <p className="font-body-sm md:font-body-md text-body-sm md:text-body-md text-on-surface-variant">Choose your primary development focus.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md md:gap-lg max-w-4xl w-full px-md md:px-lg mb-lg">
              <div className="relative w-full group">
                <div className={`absolute -inset-1 rounded-2xl blur-xl opacity-50 z-0 transition-all duration-300 ${selected === 'web' ? 'bg-gradient-to-r from-primary/30 to-secondary-container/30 opacity-100' : 'bg-gradient-to-r from-primary/10 to-secondary-container/10 group-hover:opacity-100 opacity-0'}`}></div>
                <div 
                  aria-pressed={selected === 'web'}
                  className={`relative z-10 rounded-2xl p-lg md:p-xl flex flex-col items-center text-center cursor-pointer transition-all duration-300 focus:outline-none bg-surface border border-outline-variant/30 overflow-hidden ${
                    selected === 'web' 
                      ? 'shadow-2xl border-primary/50 bg-surface-container-lowest' 
                      : 'shadow-md hover:shadow-xl hover:bg-surface-container'
                  }`}
                  onClick={() => setSelected('web')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary-container flex items-center justify-center mb-md md:mb-lg transition-transform duration-300 transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-on-primary-container text-[24px] md:text-[32px]">language</span>
                  </div>
                  <h2 className="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md text-on-surface mb-xs md:mb-sm">Web Developer</h2>
                  <p className="font-body-sm md:font-body-md text-body-sm md:text-body-md text-on-surface-variant">Build modern web applications using React, Next.js, and Tailwind CSS.</p>
                </div>
              </div>

              <div className="relative w-full group">
                <div className={`absolute -inset-1 rounded-2xl blur-xl opacity-50 z-0 transition-all duration-300 ${selected === 'app' ? 'bg-gradient-to-r from-primary/30 to-secondary-container/30 opacity-100' : 'bg-gradient-to-r from-primary/10 to-secondary-container/10 group-hover:opacity-100 opacity-0'}`}></div>
                <div 
                  aria-pressed={selected === 'app'}
                  className={`relative z-10 rounded-2xl p-lg md:p-xl flex flex-col items-center text-center cursor-pointer transition-all duration-300 focus:outline-none bg-surface border border-outline-variant/30 overflow-hidden ${
                    selected === 'app' 
                      ? 'shadow-2xl border-primary/50 bg-surface-container-lowest' 
                      : 'shadow-md hover:shadow-xl hover:bg-surface-container'
                  }`}
                  onClick={() => setSelected('app')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary-container flex items-center justify-center mb-md md:mb-lg transition-transform duration-300 transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-on-secondary-container text-[24px] md:text-[32px]">smartphone</span>
                  </div>
                  <h2 className="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md text-on-surface mb-xs md:mb-sm">App Developer</h2>
                  <p className="font-body-sm md:font-body-md text-body-sm md:text-body-md text-on-surface-variant">Develop native mobile and desktop applications with Flutter, Swift, or Kotlin.</p>
                </div>
              </div>
            </div>

            <div className="w-full max-w-4xl mt-md md:mt-xl flex justify-center md:justify-end items-center px-md md:px-lg pb-lg md:pb-0">
              <button 
                className={`w-full md:w-auto px-lg py-sm rounded-lg font-body-md text-body-md transition-colors duration-300 ${
                  selected 
                    ? 'bg-primary text-on-primary hover:bg-primary-fixed-dim cursor-pointer' 
                    : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                }`}
                disabled={!selected}
                onClick={() => {
                  navigate('/onboarding/tech', { state: { type: selected } });
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
