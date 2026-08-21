import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  SiJavascript, SiTypescript, SiPython, SiPhp, SiRuby, SiGo,
  SiReact, SiNextdotjs, SiVuedotjs, SiSvelte, SiExpress, SiDjango, SiLaravel,
  SiPostgresql, SiMongodb, SiPrisma, SiDocker, SiKubernetes, SiRedis, SiMysql,
  SiDart, SiSwift, SiKotlin, SiFlutter, SiExpo, SiFirebase, SiSupabase, SiSqlite, SiIonic, SiFastlane, SiJetpackcompose
} from 'react-icons/si';
import { FaJava, FaApple, FaAndroid, FaDatabase } from 'react-icons/fa';

const webTechData = {
  languages: [
    { id: 'js', name: 'JavaScript', icon: SiJavascript },
    { id: 'ts', name: 'TypeScript', icon: SiTypescript },
    { id: 'py', name: 'Python', icon: SiPython },
    { id: 'php', name: 'PHP', icon: SiPhp },
    { id: 'ruby', name: 'Ruby', icon: SiRuby },
    { id: 'go', name: 'Go', icon: SiGo }
  ],
  frameworks: [
    { id: 'react', name: 'React', icon: SiReact },
    { id: 'next', name: 'Next.js', icon: SiNextdotjs },
    { id: 'vue', name: 'Vue.js', icon: SiVuedotjs },
    { id: 'laravel', name: 'Laravel', icon: SiLaravel },
    { id: 'svelte', name: 'Svelte', icon: SiSvelte },
    { id: 'express', name: 'Express', icon: SiExpress },
    { id: 'django', name: 'Django', icon: SiDjango }
  ],
  tools: [
    { id: 'pg', name: 'PostgreSQL', icon: SiPostgresql },
    { id: 'mysql', name: 'MySQL', icon: SiMysql },
    { id: 'mongo', name: 'MongoDB', icon: SiMongodb },
    { id: 'prisma', name: 'Prisma', icon: SiPrisma },
    { id: 'docker', name: 'Docker', icon: SiDocker },
    { id: 'k8s', name: 'Kubernetes', icon: SiKubernetes },
    { id: 'redis', name: 'Redis', icon: SiRedis }
  ]
};

const appTechData = {
  languages: [
    { id: 'dart', name: 'Dart', icon: SiDart },
    { id: 'swift', name: 'Swift', icon: SiSwift },
    { id: 'kotlin', name: 'Kotlin', icon: SiKotlin },
    { id: 'ts', name: 'TypeScript', icon: SiTypescript },
    { id: 'js', name: 'JavaScript', icon: SiJavascript },
    { id: 'java', name: 'Java', icon: FaJava }
  ],
  frameworks: [
    { id: 'flutter', name: 'Flutter', icon: SiFlutter },
    { id: 'rn', name: 'React Native', icon: SiReact },
    { id: 'expo', name: 'Expo', icon: SiExpo },
    { id: 'compose', name: 'Jetpack Compose', icon: SiJetpackcompose },
    { id: 'swiftui', name: 'SwiftUI', icon: FaApple },
    { id: 'ionic', name: 'Ionic', icon: SiIonic }
  ],
  tools: [
    { id: 'firebase', name: 'Firebase', icon: SiFirebase },
    { id: 'supabase', name: 'Supabase', icon: SiSupabase },
    { id: 'sqlite', name: 'SQLite', icon: SiSqlite },
    { id: 'realm', name: 'Realm', icon: FaDatabase },
    { id: 'fastlane', name: 'Fastlane', icon: SiFastlane },
    { id: 'testflight', name: 'TestFlight', icon: FaApple }
  ]
};

export default function OnboardingTechStack() {
  const navigate = useNavigate();
  const location = useLocation();
  const devType = location.state?.type || 'web';
  const techData = devType === 'app' ? appTechData : webTechData;
  
  const [selectedTech, setSelectedTech] = useState<Set<string>>(new Set(devType === 'app' ? ['dart', 'flutter', 'firebase'] : ['js', 'react', 'pg']));

  const toggleSelection = (id: string) => {
    setSelectedTech(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderPill = (item: { id: string, name: string, icon: any }) => {
    const isSelected = selectedTech.has(item.id);
    const IconComponent = item.icon;
    
    return (
      <button
        key={item.id}
        onClick={() => toggleSelection(item.id)}
        className={`tech-pill flex items-center gap-2 px-sm md:px-md py-xs md:py-sm rounded-full font-body-sm text-[13px] md:text-body-sm shadow-sm relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${
          isSelected 
            ? 'bg-primary text-on-primary shadow-[0_4px_12px_rgba(173,198,255,0.3)]' 
            : 'bg-surface-container text-on-surface hover:bg-surface-container-high outline outline-1 outline-surface-variant'
        }`}
      >
        <IconComponent className={`text-[14px] md:text-[16px] ${isSelected ? 'text-on-primary' : 'text-primary'}`} />
        <span className="font-medium">{item.name}</span>
        <div className={`ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5 flex items-center justify-center transition-all duration-300 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50 absolute right-2 md:right-4'}`}>
          <span className="material-symbols-outlined text-[14px] md:text-[16px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
      </button>
    );
  };

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
        <div className="flex flex-col w-full max-w-container-max mx-auto h-full min-h-[600px] relative">
          <div className="w-full flex justify-center mb-6 pt-4">
            <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full shadow-md">
              <div className="w-2 h-2 rounded-full bg-primary/40"></div>
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(173,198,255,0.6)]"></div>
              <div className="w-2 h-2 rounded-full bg-surface-variant"></div>
            </div>
          </div>
          <div className="flex-grow flex flex-col pt-8 pb-16 px-4 sm:px-8 max-w-4xl mx-auto w-full">
            <div className="mb-8 text-center animate-[fadeIn_0.5s_ease-out]">
              <h1 className="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md text-on-surface mb-2">What technologies do you use?</h1>
              <p className="font-body-sm md:font-body-md text-body-sm md:text-body-md text-on-surface-variant max-w-2xl mx-auto">Select all that apply to tailor the AI's environment.</p>
            </div>
            
            <div className="space-y-8">
              <div className="animate-[slideUp_0.6s_ease-out_0.1s_both]">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="font-headline-md text-body-md uppercase tracking-wider text-primary">Languages</h2>
                  <div className="h-px bg-surface-variant flex-grow"></div>
                  <span className="font-code-sm text-label-caps text-on-surface-variant opacity-50">01</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {techData.languages.map(renderPill)}
                </div>
              </div>
              
              <div className="animate-[slideUp_0.6s_ease-out_0.2s_both]">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="font-headline-md text-body-md uppercase tracking-wider text-primary">Frameworks</h2>
                  <div className="h-px bg-surface-variant flex-grow"></div>
                  <span className="font-code-sm text-label-caps text-on-surface-variant opacity-50">02</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {techData.frameworks.map(renderPill)}
                </div>
              </div>
              
              <div className="animate-[slideUp_0.6s_ease-out_0.3s_both]">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="font-headline-md text-body-md uppercase tracking-wider text-primary">Databases &amp; Tools</h2>
                  <div className="h-px bg-surface-variant flex-grow"></div>
                  <span className="font-code-sm text-label-caps text-on-surface-variant opacity-50">03</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {techData.tools.map(renderPill)}
                </div>
              </div>
            </div>
            
            <div className="w-full flex flex-col-reverse sm:flex-row justify-between items-center mt-12 pt-8 border-t border-surface-variant gap-4 sm:gap-0 animate-[slideUp_0.6s_ease-out_0.4s_both]">
              <button onClick={() => navigate(-1)} className="w-full sm:w-auto justify-center px-6 py-3 rounded-lg font-body-md text-body-md text-on-surface bg-surface-container-high hover:bg-surface-variant transition-colors flex items-center gap-2 group">
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Back
              </button>
              <div className="flex gap-4 w-full sm:w-auto">
                <button onClick={() => navigate('/onboarding/ai', { state: { devType, techStack: Array.from(selectedTech) } })} className="w-full sm:w-auto justify-center px-8 py-3 rounded-lg font-body-md text-body-md font-semibold text-on-primary bg-primary hover:bg-primary-fixed-dim transition-all shadow-[0_0_20px_rgba(173,198,255,0.2)] hover:shadow-[0_0_30px_rgba(173,198,255,0.4)] flex items-center gap-2 group">
                  Continue
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
