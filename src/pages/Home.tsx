import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import Swal from 'sweetalert2';

interface PlanStep {
  number: number;
  title: string;
  description: string;
}

interface PlanData {
  rawPlan: string;
  steps: PlanStep[];
  projectId: string;
  originalPrompt: string;
}

function parsePlanSteps(planText: string): PlanStep[] {
  const rawSteps: { title: string; description: string }[] = [];
  const lines = planText.split('\n');
  let currentStep: { title: string; description: string } | null = null;
  let lastStepNum = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Only match lines that START with a number followed by . or ) or :
    // AND the number must be sequential (lastStepNum + 1 or lastStepNum + 0 for sub-items)
    // Strict: number must be at the very beginning, and must be sequential
    const stepMatch = trimmed.match(/^(?:#+\s*)?(\d+)[.):]\s+(.+)/);
    if (stepMatch) {
      const num = parseInt(stepMatch[1]);
      const title = stepMatch[2].replace(/\*\*/g, '').replace(/^\*|\*$/g, '').trim();
      // Only accept if sequential (num === lastStepNum + 1) to avoid sub-list numbers
      if (num === lastStepNum + 1) {
        if (currentStep) rawSteps.push(currentStep);
        currentStep = { title, description: '' };
        lastStepNum = num;
      } else if (currentStep) {
        // Treat as description text
        currentStep.description += (currentStep.description ? ' ' : '') + trimmed;
      }
    } else if (currentStep && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
      const clean = trimmed.replace(/\*\*/g, '').replace(/^[-*]\s*/, '').trim();
      if (clean) currentStep.description += (currentStep.description ? ' ' : '') + clean;
    }
  }
  if (currentStep) rawSteps.push(currentStep);

  if (rawSteps.length === 0 && planText.trim()) {
    return [{ number: 1, title: 'Execute the Plan', description: planText.trim().slice(0, 200) }];
  }

  // Re-number sequentially so duplicates can never happen
  return rawSteps.map((s, i) => ({ number: i + 1, title: s.title, description: s.description }));
}

export default function Home() {
  const [projectType, setProjectType] = useState('webapp');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const email = localStorage.getItem('userEmail');
        if (!email) return null;
        const response = await api.get(`/users/me?email=${email}`);
        return response.data?.user || response.data?.data || null;
      } catch (e) { return null; }
    }
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const email = localStorage.getItem('userEmail');
        const url = email ? `/projects/?email=${email}` : '/projects/';
        const response = await api.get(url);
        return response.data?.projects || response.data?.data || [];
      } catch (e) { return []; }
    }
  });

  const isLoggedIn = !!userProfile;

  useEffect(() => {
    if (userProfile?.domainFocus) {
      setProjectType(userProfile.domainFocus === 'MOBILE' ? 'mobileapp' : 'webapp');
    }
  }, [userProfile?.domainFocus]);

  const generatePlanMutation = useMutation({
    mutationFn: async (data: { prompt: string; projectType: string }) => {
      const email = localStorage.getItem('userEmail');
      const projectRes = await api.post('/projects/create', {
        name: data.prompt.length > 40 ? data.prompt.slice(0, 40) + '...' : data.prompt,
        description: data.prompt,
        email
      });
      const projectId = projectRes.data?.data?.id || projectRes.data?.id;
      const planRes = await api.post('/ai/plan', { prompt: data.prompt, projectId });
      return { plan: planRes.data?.data?.plan || planRes.data?.plan, projectId, originalPrompt: data.prompt };
    },
    onSuccess: (data) => {
      const steps = parsePlanSteps(data.plan);
      setPlanData({ rawPlan: data.plan, steps, projectId: data.projectId, originalPrompt: data.originalPrompt });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      Swal.fire('Error', error.response?.data?.message || 'Failed to generate plan. Please try again.', 'error');
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setPlanData(null);
    generatePlanMutation.mutate({ prompt: prompt.trim(), projectType });
  };

  const handleProceedWithStep = (step: PlanStep) => {
    if (!planData) return;
    const stepPrompt = `Execute Step ${step.number}: ${step.title}\n\n${step.description}\n\nContext: This is part of the overall plan for: ${planData.originalPrompt}`;
    navigate('/workspace', {
      state: {
        projectId: planData.projectId,
        prompt: stepPrompt,
        plan: planData,
        currentStep: step.number,
        totalSteps: planData.steps.length,
      }
    });
  };

  return (
    <div className="bg-background font-body-md text-body-md text-on-background flex h-screen overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-sidebar-width bg-surface-container-low border-r border-outline-variant/30 flex flex-col z-50 transition-transform duration-300 ${isSidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
        <div className="p-md flex flex-col gap-md">
          <div className="flex items-center gap-sm px-base mb-sm">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[20px]">terminal</span>
            </div>
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight">DevCore</span>
          </div>
          <button onClick={() => { setPlanData(null); setPrompt(''); }} className="flex items-center justify-center gap-sm w-full py-sm px-md bg-primary text-on-primary font-body-md text-body-md rounded-lg transition-all hover:bg-primary-fixed-dim hover:shadow-md hover:shadow-primary/20 active:scale-[0.98]">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Chat</span>
          </button>
        </div>

        <div className="px-md mb-sm">
          <span className="font-label-caps text-label-caps text-on-surface-variant">RECENTS</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-sm flex flex-col gap-xs">
          {projects && projects.length > 0 ? (
            projects.map((project: any) => (
              <div key={project.id} className="group relative flex items-center">
                <Link to="/workspace" state={{ projectId: project.id }} className="flex-1 flex items-center px-md py-sm rounded transition-colors text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
                  <span className="material-symbols-outlined text-[18px] mr-sm opacity-60 group-hover:opacity-100">chat_bubble</span>
                  <span className="truncate max-w-[150px]">{project.name}</span>
                </Link>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    Swal.fire({
                      title: 'Are you sure?',
                      text: "Do you really want to delete this project?",
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#f87171',
                      cancelButtonColor: '#374151',
                      confirmButtonText: 'Yes, delete it!'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        deleteProjectMutation.mutate(project.id);
                      }
                    });
                  }}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md text-on-surface-variant hover:bg-error/10 hover:text-error transition-all"
                  title="Delete Project"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            ))
          ) : (
            <div className="px-md py-sm text-on-surface-variant text-body-sm opacity-60">No recent projects</div>
          )}
        </nav>

        {isLoggedIn && (
          <div className="p-md border-t border-outline-variant/20 flex flex-col gap-sm">
            <Link to="/profile" className="flex items-center px-md py-sm rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[20px] mr-sm">settings</span>
              <span>Settings</span>
            </Link>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 pl-0 ${isSidebarCollapsed ? 'md:pl-0' : 'md:pl-sidebar-width'}`}>
        {/* Header */}
        <header className="shrink-0 h-[72px] w-full bg-background z-30 border-b border-outline-variant/10">
          <div className="h-full w-full px-sm md:px-lg flex items-center justify-between">
            <div className="flex items-center gap-sm md:gap-md">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface p-1" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                {isSidebarCollapsed ? 'menu' : 'menu_open'}
              </span>
              <div className="flex items-center gap-sm bg-surface-container px-sm md:px-md py-xs rounded-full border border-outline-variant/20 focus-within:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-body-md text-on-surface-variant">search</span>
                <input className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-body-sm w-32 md:w-48 text-on-surface placeholder:text-outline" placeholder="Search..." type="text" />
              </div>
            </div>
            <div className="flex items-center gap-sm md:gap-lg">
              <span 
                className="material-symbols-outlined text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => Swal.fire({
                  title: 'DevCore Help',
                  html: 'DevCore is your AI-powered development workspace.<br/><br/>Enter a project idea in the prompt below, and DevCore will automatically generate a step-by-step development plan. You can then execute each step iteratively.',
                  icon: 'info',
                  confirmButtonText: 'Got it!'
                })}
              >
                help_outline
              </span>
              {isLoggedIn ? (
                <div className="relative group/profile">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg cursor-pointer">
                    <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                  </div>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-2xl opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-200 py-2 overflow-hidden z-[100]">
                    <div className="px-md py-xs border-b border-outline-variant/20 mb-xs">
                      <p className="font-body-sm font-medium text-on-surface truncate">{userProfile?.name || 'DevUser'}</p>
                      <p className="text-[11px] text-on-surface-variant truncate">{userProfile?.email}</p>
                    </div>
                    <Link to="/profile" className="w-full px-md py-2 flex items-center gap-3 hover:bg-surface-variant transition-colors text-left text-on-surface">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">settings</span>
                      <span className="font-body-sm">Settings</span>
                    </Link>
                    <button onClick={() => navigate('/login')} className="w-full px-md py-2 flex items-center gap-3 hover:bg-error/20 hover:text-error transition-colors text-left text-error mt-xs border-t border-outline-variant/10">
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span className="font-body-sm">Log out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="bg-primary hover:bg-primary-fixed text-on-primary font-body-sm text-body-sm font-medium px-md py-1.5 rounded-lg transition-colors shadow-md">
                  Log in
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page body — flex column, fills remaining height */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(circle at 50% -20%, var(--color-primary-container), transparent 60%)" }}></div>

          {/* Scrollable area — plan steps / empty state */}
          <div className="flex-1 overflow-y-auto flex flex-col items-center px-sm md:px-xl pt-lg md:pt-xl pb-md z-10">
            <div className="w-full max-w-4xl flex flex-col gap-lg">

              {/* Empty state */}
              {!planData && !generatePlanMutation.isPending && (
                <div className="flex flex-col items-center text-center gap-md py-xl md:py-2xl px-sm">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-container border border-outline-variant/30 shadow-xl mb-sm relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl"></div>
                    <span className="material-symbols-outlined text-primary text-[32px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  </div>
                  <h1 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-surface">What shall we build today?</h1>
                  <p className="font-body-sm md:font-body-md text-body-sm md:text-body-md text-on-surface-variant max-w-[32rem]">
                    Describe your idea below. The assistant creates a step-by-step plan — then builds it one phase at a time.
                  </p>
                  <p className="font-body-sm text-[13px] text-on-surface-variant opacity-60">AI can make mistakes. Verify important outputs.</p>
                </div>
              )}

              {/* Plan steps */}
              {planData && !generatePlanMutation.isPending && (
                <div className="flex flex-col gap-lg animate-[fadeInUp_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]">
                  {/* Plan header */}
                  <div className="flex items-center gap-md p-md bg-primary/5 rounded-xl border border-primary/20">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>checklist</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="font-headline-sm text-on-surface">Your Development Plan</h2>
                      <p className="font-body-sm text-on-surface-variant">
                        {planData.steps.length} steps — proceed one step at a time, the rest unlock as you go
                      </p>
                    </div>
                    <button
                      onClick={() => setPlanData(null)}
                      className="w-8 h-8 rounded-lg hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                      title="Regenerate"
                    >
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                    </button>
                  </div>

                  {/* Steps */}
                  <div className="flex flex-col gap-sm">
                    {planData.steps.map((step, index) => {
                      const isUnlocked = step.number === 1;
                      return (
                        <div
                          key={step.number}
                          className={`flex gap-md p-lg rounded-xl border transition-all ${
                            isUnlocked
                              ? 'bg-surface-container border-outline-variant/20 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5'
                              : 'bg-surface-container/40 border-outline-variant/10 opacity-55 select-none'
                          }`}
                        >
                          {/* Number bubble + connector line */}
                          <div className="flex flex-col items-center gap-xs shrink-0">
                            <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${
                              isUnlocked ? 'bg-primary/10 border-primary/30' : 'bg-surface-container-high border-outline-variant/30'
                            }`}>
                              {isUnlocked
                                ? <span className="font-bold text-primary text-[14px]">{step.number}</span>
                                : <span className="material-symbols-outlined text-on-surface-variant text-[15px]">lock</span>
                              }
                            </div>
                            {index < planData.steps.length - 1 && (
                              <div className="w-[2px] flex-1 min-h-[16px] bg-outline-variant/30 rounded-full"></div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 flex flex-col gap-xs">
                            <h3 className={`font-body-md font-semibold leading-snug ${isUnlocked ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                              {step.title}
                            </h3>
                            {step.description && (
                              <p className="font-body-sm text-on-surface-variant leading-relaxed line-clamp-2">{step.description}</p>
                            )}
                          </div>

                          {/* Action */}
                          <div className="shrink-0 flex items-center">
                            {isUnlocked ? (
                              <button
                                onClick={() => handleProceedWithStep(step)}
                                className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary font-body-sm font-medium rounded-lg shadow-sm hover:bg-primary-fixed-dim transition-all whitespace-nowrap"
                              >
                                <span>Proceed</span>
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-xs px-md py-sm font-body-sm text-on-surface-variant bg-surface-container-high rounded-lg border border-outline-variant/20 whitespace-nowrap cursor-not-allowed">
                                <span className="material-symbols-outlined text-[14px]">lock</span>
                                <span>Locked</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Sticky bottom: prompt textarea ── */}
          <div className="shrink-0 w-full flex justify-center px-sm md:px-xl pb-sm md:pb-lg pt-sm md:pt-md z-20 bg-background/80 backdrop-blur-sm border-t border-outline-variant/10">
            <div className="w-full max-w-4xl flex flex-col bg-surface-container rounded-xl shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 relative group transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleGenerate(); }}
                className="w-full h-24 md:h-32 bg-transparent text-on-surface font-body-md text-body-md p-sm md:p-lg resize-none focus:outline-none placeholder:text-outline-variant/70 leading-relaxed"
                placeholder={`Describe your project idea...\n\nE.g., 'Build a MERN e-commerce platform with auth, products, cart...'`}
                spellCheck="false"
                disabled={generatePlanMutation.isPending}
              />

              <div className="flex flex-col sm:flex-row items-center justify-between p-sm md:p-md bg-surface-container-low gap-sm md:gap-md border-t border-outline-variant/10">
                <div className="flex items-center gap-md w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center bg-surface-container rounded-lg p-[2px] shadow-sm w-full sm:w-auto">
                    <label className="cursor-pointer flex-1 sm:flex-none">
                      <input className="peer sr-only" name="project_type" type="radio" value="webapp" checked={projectType === 'webapp'} onChange={() => setProjectType('webapp')} />
                      <div className="flex items-center justify-center sm:justify-start gap-xs px-md py-sm rounded-md font-body-sm text-body-sm text-on-surface-variant peer-checked:bg-surface-container-highest peer-checked:text-on-surface transition-all peer-checked:shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">language</span>
                        Web
                      </div>
                    </label>
                    <label className="cursor-pointer flex-1 sm:flex-none">
                      <input className="peer sr-only" name="project_type" type="radio" value="mobileapp" checked={projectType === 'mobileapp'} onChange={() => setProjectType('mobileapp')} />
                      <div className="flex items-center justify-center sm:justify-start gap-xs px-md py-sm rounded-md font-body-sm text-body-sm text-on-surface-variant peer-checked:bg-surface-container-highest peer-checked:text-on-surface transition-all peer-checked:shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">smartphone</span>
                        Mobile
                      </div>
                    </label>
                  </div>
                  <span className="text-on-surface-variant opacity-50 text-[12px] hidden sm:block">Ctrl+Enter to generate</span>
                </div>

                <button
                  disabled={generatePlanMutation.isPending || !prompt.trim()}
                  onClick={handleGenerate}
                  className="flex items-center justify-center gap-sm px-lg py-sm bg-primary text-on-primary font-body-sm font-bold text-body-sm rounded-lg shadow-lg hover:shadow-primary/20 transition-all relative overflow-hidden group/btn disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto mt-2 sm:mt-0"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                  {generatePlanMutation.isPending ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] relative z-10 animate-spin">progress_activity</span>
                      <span className="relative z-10">Planning...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Generate Plan</span>
                      <span className="material-symbols-outlined text-[18px] relative z-10 group-hover/btn:translate-x-1 transition-transform">auto_awesome</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
