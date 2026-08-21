import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

// ─── File Tree Component ───────────────────────────────────────────────
type FileItem = { name: string; content: string };

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) return 'javascript';
  if (['json'].includes(ext || '')) return 'data_object';
  if (['css', 'scss'].includes(ext || '')) return 'css';
  if (['md'].includes(ext || '')) return 'article';
  if (['env', 'gitignore'].includes(filename.replace(/^\./, ''))) return 'settings';
  if (['sh', 'bash'].includes(ext || '')) return 'terminal';
  if (['sql', 'prisma'].includes(ext || '')) return 'storage';
  return 'description';
}

function buildTree(files: FileItem[]): Record<string, any> {
  const tree: Record<string, any> = {};
  for (const file of files) {
    const parts = file.name.split('/');
    let node = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        node[part] = file; // leaf = file
      } else {
        node[part] = node[part] || {};
        node = node[part];
      }
    }
  }
  return tree;
}

function TreeNode({ name, node, depth, selectedFile, onSelect }: {
  name: string; node: any; depth: number;
  selectedFile: FileItem | null; onSelect: (f: FileItem) => void;
}) {
  const [open, setOpen] = useState(true);
  const isFile = node && typeof node.content === 'string';
  const indent = depth * 12;

  if (isFile) {
    const active = selectedFile?.name === node.name;
    return (
      <div
        onClick={() => onSelect(node)}
        style={{ paddingLeft: `${indent + 8}px` }}
        className={`group flex items-center h-7 pr-2 rounded cursor-pointer select-none transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
      >
        <span className={`material-symbols-outlined text-[15px] mr-1.5 ${active ? 'text-primary' : 'text-on-surface-variant opacity-70'}`}>
          {getFileIcon(name)}
        </span>
        <span className="font-body-sm text-[12px] truncate">{name}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => setOpen(!open)}
        style={{ paddingLeft: `${indent + 4}px` }}
        className="group flex items-center h-7 pr-2 rounded cursor-pointer select-none text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
      >
        <span className="material-symbols-outlined text-[15px] mr-1 text-on-surface-variant/60">
          {open ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
        </span>
        <span className="material-symbols-outlined text-[15px] mr-1.5 text-amber-400/80">
          {open ? 'folder_open' : 'folder'}
        </span>
        <span className="font-body-sm text-[12px] font-medium truncate">{name}</span>
      </div>
      {open && Object.entries(node).map(([childName, childNode]) => (
        <TreeNode key={childName} name={childName} node={childNode} depth={depth + 1} selectedFile={selectedFile} onSelect={onSelect} />
      ))}
    </div>
  );
}

function FileTree({ files, selectedFile, onSelect, projectName }: { files: FileItem[]; selectedFile: FileItem | null; onSelect: (f: FileItem) => void; projectName: string }) {
  const tree = buildTree(files);
  const [open, setOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDownloadZip = async () => {
    setMenuOpen(false);
    const zip = new JSZip();
    
    // Add all files to zip
    files.forEach(file => {
      zip.file(file.name, file.content);
    });
    
    // Generate and download
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`);
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = () => setMenuOpen(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [menuOpen]);

  return (
    <div className="flex flex-col gap-0.5 px-1 pb-4">
      <div className="relative">
        <div className="group flex items-center justify-between h-8 pr-1 rounded select-none text-on-surface hover:bg-surface-container-high transition-colors">
          <div className="flex items-center flex-1 overflow-hidden cursor-pointer h-full" onClick={() => setOpen(!open)}>
            <span className="material-symbols-outlined text-[15px] mr-1 text-on-surface-variant/60">
              {open ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
            </span>
            <span className="material-symbols-outlined text-[15px] mr-1.5 text-primary/80">
              home_storage
            </span>
            <span className="font-body-sm text-[12px] font-bold truncate pr-2">{projectName}</span>
          </div>
          
          {/* 3-dot menu */}
          <div className="relative h-full flex items-center shrink-0">
            <button 
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors"
              title="More options"
            >
              <span className="material-symbols-outlined text-[16px]">more_vert</span>
            </button>
            {menuOpen && (
              <div 
                className="absolute right-0 top-full mt-1 w-[160px] bg-surface-container-high border border-outline-variant/30 rounded-lg shadow-xl py-1 z-50 overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={handleDownloadZip}
                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-surface-variant transition-colors text-left text-[12px] font-medium text-on-surface whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[15px] text-primary">download</span>
                  Download as ZIP
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Children (tree) */}
        {open && (
          <div className="flex flex-col gap-0.5 mt-0.5">
            {Object.entries(tree).map(([name, node]) => (
              <TreeNode key={name} name={name} node={node} depth={1} selectedFile={selectedFile} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Response Summary Card ──────────────────────────────────────────
function AiResponseCard({ response }: { response: string }) {
  const [expanded, setExpanded] = useState(false);

  // Extract file list from <file path="..."> tags
  const fileRegex = /<file\s+path="([^"]+)">/g;
  const fileNames: string[] = [];
  let m;
  while ((m = fileRegex.exec(response)) !== null) fileNames.push(m[1]);

  // Extract plain text (strip XML file blocks)
  const plainText = response
    .replace(/<file\s+path="[^"]*">[\s\S]*?<\/file>/g, '')
    .replace(/---+/g, '')
    .trim();

  const hasFiles = fileNames.length > 0;

  return (
    <div className="flex gap-3 max-w-[95%]">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-primary/20 border-primary/30">
        <span className="material-symbols-outlined text-[16px] text-primary">temp_preferences_custom</span>
      </div>
      <div className="flex flex-col gap-sm flex-1">
        {/* Summary card */}
        {hasFiles && (
          <div className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm">
            <div className="flex items-center gap-sm px-sm py-xs bg-primary/5 border-b border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-[16px]">folder_zip</span>
              <span className="font-body-sm font-semibold text-on-surface">{fileNames.length} file{fileNames.length > 1 ? 's' : ''} generated</span>
            </div>
            <div className="flex flex-col max-h-36 overflow-y-auto py-xs">
              {fileNames.map((f, i) => (
                <div key={i} className="flex items-center gap-xs px-sm py-[3px]">
                  <span className="material-symbols-outlined text-[13px] text-on-surface-variant opacity-60">{getFileIcon(f)}</span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant truncate">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Plain text summary */}
        {plainText && (
          <div className="bg-surface-container p-sm rounded-xl rounded-tl-sm border border-outline-variant/20 shadow-sm">
            <p className={`text-body-sm leading-relaxed text-on-surface ${!expanded && plainText.length > 200 ? 'line-clamp-3' : ''}`}>
              {plainText}
            </p>
            {plainText.length > 200 && (
              <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-primary mt-xs hover:underline">
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Env Instructions Card ────────────────────────────────────────────
function EnvInstructionsCard({ files }: { files: { name: string; content: string }[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  // Collect all .env files and their variables
  const envFiles = files.filter(f => f.name.endsWith('.env') || f.name.includes('/.env'));

  // Also scan all files for process.env.X references (unique vars)
  const allEnvRefs = new Set<string>();
  files.forEach(f => {
    const matches = f.content.matchAll(/process\.env\.([A-Z_][A-Z0-9_]*)/g);
    for (const m of matches) allEnvRefs.add(m[1]);
  });

  if (envFiles.length === 0 && allEnvRefs.size === 0) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="bg-surface-container rounded-xl border border-amber-500/20 overflow-hidden shadow-sm">
      <div className="flex items-center gap-sm px-sm py-xs bg-amber-500/5 border-b border-amber-500/15">
        <span className="material-symbols-outlined text-amber-400 text-[16px]">settings</span>
        <span className="font-body-sm font-semibold text-on-surface">Environment Setup Required</span>
      </div>
      <div className="flex flex-col gap-sm p-sm">
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          Before running the app, update these <code className="bg-surface-container-high px-1 rounded">.env</code> files:
        </p>
        {envFiles.map((ef) => (
          <div key={ef.name} className="rounded-lg border border-outline-variant/20 overflow-hidden">
            <div className="flex items-center justify-between px-sm py-[4px] bg-surface-container-high border-b border-outline-variant/10">
              <span className="text-[11px] font-semibold text-on-surface-variant">{ef.name}</span>
              <button
                onClick={() => handleCopy(ef.content, ef.name)}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                <span className="material-symbols-outlined text-[13px]">{copied === ef.name ? 'check' : 'content_copy'}</span>
                {copied === ef.name ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="text-[11px] p-sm text-on-surface font-code-sm overflow-x-auto leading-relaxed max-h-32 overflow-y-auto">
              {ef.content}
            </pre>
          </div>
        ))}
        {allEnvRefs.size > 0 && (
          <div className="mt-xs">
            <p className="text-[11px] text-on-surface-variant mb-xs">Variables referenced in code:</p>
            <div className="flex flex-wrap gap-xs">
              {[...allEnvRefs].map(v => (
                <code key={v} className="text-[10px] bg-surface-container-high border border-outline-variant/20 px-1.5 py-0.5 rounded text-amber-400">{v}</code>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Workspace() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('code');
  const projectId = location.state?.projectId;
  const initialPrompt = location.state?.prompt;
  const plan = location.state?.plan;
  const currentStep: number = location.state?.currentStep || 0;
  const totalSteps: number = location.state?.totalSteps || 0;
  // Don't pre-fill the chat input with the initial prompt
  const [prompt, setPrompt] = useState('');
  
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [aiPanelWidth, setAiPanelWidth] = useState(360);
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const isResizingRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const initialPromptSent = useRef(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  // Simple done flag — true once AI finishes and messages are reloaded
  const [isDone, setIsDone] = useState(false);
  // Editable content for the currently open file
  const [editedContent, setEditedContent] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  // Preview is unlocked only when all steps are complete
  const previewUnlocked = !plan || (isDone && currentStep === totalSteps);
  
  // Virtual File System State
  const [files, setFiles] = useState<{name: string, content: string}[]>([]);
  const [selectedFile, setSelectedFile] = useState<{name: string, content: string} | null>(null);

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', projectId],
    queryFn: async () => {
      const response = await api.get(`/messages?projectId=${projectId}`);
      return response.data?.data || [];
    },
    enabled: !!projectId
  });

  const generateAiMutation = useMutation({
    mutationFn: async (data: { prompt: string, projectId: string }) => {
      console.log('[AI] Sending request...', data.projectId);
      const response = await api.post('/ai/generate', data);
      console.log('[AI] Response received');
      return response.data;
    },
    onSuccess: async () => {
      console.log('[AI] onSuccess — refetching messages');
      await refetchMessages();
      console.log('[AI] messages refetched — setting isDone=true');
      setIsDone(true);
      setPrompt('');
    },
    onError: (error: any) => {
      console.error('[AI] Error:', error.response?.data?.message || error.message);
      Swal.fire('Error', error.response?.data?.message || 'Failed to generate AI response.', 'error');
      setIsDone(true); 
    }
  });



  const handleSendPrompt = () => {
    if (!prompt) return;
    if (!projectId) {
        Swal.fire('Warning', 'No project selected.', 'warning');
        return;
    }
    setIsDone(false);
    generateAiMutation.mutate({ prompt, projectId });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
  }, []);

  // Auto-submit initial prompt — reset on every new step
  useEffect(() => {
    if (initialPrompt && projectId) {
      console.log('[Workspace] Auto-submitting for step:', currentStep, '| sent?', initialPromptSent.current);
      if (!initialPromptSent.current) {
        initialPromptSent.current = true;
        setIsDone(false);
        generateAiMutation.mutate({ prompt: initialPrompt, projectId });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, projectId]);

  // Debug
  useEffect(() => {
    console.log('[State] isDone:', isDone, '| isPending:', generateAiMutation.isPending, '| messages:', messages?.length ?? 0);
  }, [isDone, generateAiMutation.isPending, messages]);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generateAiMutation.isPending]);

  // Parse files from messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      const parsedFiles: {name: string, content: string}[] = [];
      const fileMap = new Map<string, string>();
      
      messages.forEach((msg: any) => {
        if (msg.response) {
          // Regex to extract XML file blocks: <file path="...">...</file>
          // Added [\s\S]*? to capture multiline content correctly
          const regex = /<file\s+path="([^"]+)">([\s\S]*?)<\/file>/g;
          let match;
          while ((match = regex.exec(msg.response)) !== null) {
            const filePath = match[1];
            const content = match[2];
            // Override previous content if same file is updated
            fileMap.set(filePath, content.trim());
          }
        }
      });
      
      // Convert map to array
      fileMap.forEach((content, name) => {
          parsedFiles.push({ name, content });
      });
      
      setFiles(parsedFiles);
      
      if (parsedFiles.length > 0 && !selectedFile) {
        setSelectedFile(parsedFiles[0]);
      } else if (parsedFiles.length > 0 && selectedFile) {
        // Update selected file content if it was modified
        const updated = parsedFiles.find(f => f.name === selectedFile.name);
        if (updated) setSelectedFile(updated);
      }
    }
  }, [messages]);
  // Sync edited content when selected file changes
  useEffect(() => {
    if (selectedFile) {
      setEditedContent(selectedFile.content);
      setIsSaved(false);
    }
  }, [selectedFile?.name]);

  // Save file content
  const handleSaveFile = useCallback(() => {
    if (!selectedFile || editedContent === selectedFile.content) return;
    const updated = { ...selectedFile, content: editedContent };
    setSelectedFile(updated);
    setFiles(prev => prev.map(f => f.name === updated.name ? updated : f));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }, [selectedFile, editedContent]);

  // Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFile();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveFile]);


  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = document.body.clientWidth - e.clientX;
    const maxWidth = document.body.clientWidth * 0.8;
    
    if (newWidth > maxWidth) newWidth = maxWidth;
    if (newWidth < 280) newWidth = 280;
    
    setAiPanelWidth(newWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    document.body.style.cursor = 'default';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    const handleClickOutside = () => setIsDownloadMenuOpen(false);
    document.addEventListener('click', handleClickOutside);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  return (
    <div className="bg-background font-body-md text-on-surface h-screen flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] bg-tertiary-container/10 rounded-full blur-[120px]"></div>
      </div>

      <header className="w-full bg-surface-container-lowest/80 backdrop-blur-md flex flex-col z-50 border-b border-outline-variant/30 shadow-lg relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
        <div className="h-10 w-full flex items-center justify-between px-md border-b border-outline-variant/20 relative z-10">
          <div className="flex items-center gap-sm">
            <button onClick={() => navigate('/')} className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors group">
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
              <span className="text-body-sm font-medium">Back</span>
            </button>
          </div>
          {/* Step Progress Indicator */}
          {plan && currentStep > 0 && totalSteps > 0 && (
            <div className="flex items-center gap-sm">
              <span className="font-body-sm text-on-surface-variant">Step</span>
              <div className="flex items-center gap-xs">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 < currentStep ? 'w-4 bg-primary' :
                      i + 1 === currentStep ? 'w-6 bg-primary shadow-[0_0_6px_rgba(173,198,255,0.6)]' :
                      'w-4 bg-outline-variant/40'
                    }`}
                  ></div>
                ))}
              </div>
              <span className="font-body-sm text-on-surface font-medium">{currentStep} / {totalSteps}</span>
            </div>
          )}
        </div>
        
        <div className="h-14 w-full flex items-center justify-between px-md relative z-10">
          <div className="flex-1 flex items-center">
            <div className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors border border-surface-variant/50 cursor-pointer shadow-inner z-50">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-colors">visibility</span>
              <span className="font-body-sm text-on-surface font-medium">View</span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary transition-colors">keyboard_arrow_down</span>
              
              <div className="absolute top-full left-0 mt-1 w-56 bg-surface-container-high border border-outline-variant/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 overflow-hidden z-[100]">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsExplorerOpen(!isExplorerOpen); }} 
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-surface-variant transition-colors text-left"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isExplorerOpen ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {isExplorerOpen ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <span className="font-body-sm text-on-surface">File Explorer</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsAiPanelOpen(!isAiPanelOpen); }} 
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-surface-variant transition-colors text-left"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isAiPanelOpen ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {isAiPanelOpen ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <span className="font-body-sm text-on-surface">AI Assistant</span>
                </button>
                
                <div className="h-px bg-outline-variant/20 my-1"></div>
                <div className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider">Editor Font Size</span>
                  <div className="flex items-center justify-between mt-1.5 bg-surface-container rounded-md border border-outline-variant/20 p-1">
                    <button onClick={() => setEditorFontSize(Math.max(10, editorFontSize - 1))} className="w-7 h-7 rounded hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="font-code-sm text-on-surface select-none">{editorFontSize}px</span>
                    <button onClick={() => setEditorFontSize(Math.min(24, editorFontSize + 1))} className="w-7 h-7 rounded hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                    <div className="w-px h-4 bg-outline-variant/30 mx-0.5"></div>
                    <button onClick={() => setEditorFontSize(14)} className="w-7 h-7 rounded hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors" title="Reset size">
                      <span className="material-symbols-outlined text-[14px]">refresh</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex bg-surface-container/50 backdrop-blur-md rounded-lg p-1 gap-1 border border-outline-variant/20 shadow-inner">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-5 py-1.5 rounded-md font-body-sm transition-all duration-300 ${activeTab === 'code' ? 'bg-surface-container-highest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/80'}`}
              >
                Code
              </button>
              {/* Preview — locked until all steps complete */}
              <button
                onClick={() => previewUnlocked && setActiveTab('preview')}
                title={previewUnlocked ? 'Preview' : 'Complete all steps to unlock preview'}
                className={`relative px-5 py-1.5 rounded-md font-body-sm transition-all duration-300 flex items-center gap-1.5 ${
                  !previewUnlocked
                    ? 'text-on-surface-variant/40 cursor-not-allowed'
                    : activeTab === 'preview'
                    ? 'bg-surface-container-highest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/80'
                }`}
              >
                {!previewUnlocked && (
                  <span className="material-symbols-outlined text-[13px]">lock</span>
                )}
                Preview
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-end gap-md">
            <div className="flex items-center bg-surface-container/50 hover:bg-surface-container transition-colors h-9 px-sm rounded-lg border border-outline-variant/30 min-w-[220px] shadow-inner group">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant mr-sm group-focus-within:text-primary transition-colors">search</span>
              <input ref={searchInputRef} type="text" placeholder="Search files..." className="bg-transparent border-none outline-none text-body-sm flex-1 text-on-surface placeholder:text-on-surface-variant/70" />
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-code-sm bg-surface-container-highest px-1.5 py-0.5 rounded text-on-surface-variant border border-outline-variant/30">Ctrl</span>
                <span className="text-[10px] font-code-sm bg-surface-container-highest px-1.5 py-0.5 rounded text-on-surface-variant border border-outline-variant/30">K</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden relative z-10">
        <main className="flex-1 h-full overflow-hidden bg-transparent">
          <div className="flex flex-col w-full h-full flex-1 bg-transparent">
            <div className="flex flex-1 overflow-hidden w-full h-full">
              
              {isExplorerOpen && (
              <div className="w-[240px] min-w-[240px] flex flex-col bg-surface-container-lowest/60 backdrop-blur-md border-r border-outline-variant/20 h-full overflow-hidden shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-20">
                <div className="h-12 px-md flex items-center justify-between shrink-0 border-b border-outline-variant/10">
                  <span className="font-label-caps text-[11px] tracking-wider text-on-surface-variant font-semibold select-none">EXPLORER</span>
                  <button onClick={() => setIsExplorerOpen(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-[18px]">left_panel_close</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden py-xs">
                  {files.length === 0 ? (
                    <div className="px-md py-lg text-center opacity-50 flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-[32px]">folder_open</span>
                      <span className="font-body-sm">No files generated yet</span>
                    </div>
                  ) : (
                    <FileTree 
                      files={files} 
                      selectedFile={selectedFile} 
                      onSelect={setSelectedFile} 
                      projectName={plan?.title || 'Generated Project'} 
                    />
                  )}
                </div>
              </div>
              )}
              
              <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0c]/80 backdrop-blur-sm h-full shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] relative z-10">
                
                {files.length === 0 || !selectedFile ? (
                    <div className="flex-1 flex overflow-hidden items-center justify-center bg-surface-container-lowest/30">
                      <div className="flex flex-col items-center opacity-40 gap-4 max-w-sm text-center">
                        <span className="material-symbols-outlined text-[48px]">code</span>
                        <h3 className="font-headline-sm">Code Editor</h3>
                        <p className="font-body-sm">Your generated code will appear here once the AI creates the project structure.</p>
                      </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {activeTab === 'code' ? (
                        <>
                          {/* Tab bar with Save button */}
                          <div className="h-10 flex bg-surface-container-lowest/40 backdrop-blur-md border-b border-outline-variant/20 overflow-x-auto shadow-sm shrink-0">
                            <div className="flex items-center px-md border-r border-outline-variant/20 bg-surface/60 min-w-[140px] max-w-[220px] h-full relative group flex-1">
                              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_8px_rgba(173,198,255,0.6)]"></div>
                              <span className="material-symbols-outlined text-[16px] text-primary mr-sm drop-shadow-[0_0_4px_rgba(173,198,255,0.4)]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                              <span className="font-body-sm text-body-sm text-on-surface truncate flex-1 font-medium">{selectedFile.name}</span>
                            </div>
                            {/* Save Button */}
                            <button
                              onClick={handleSaveFile}
                              disabled={editedContent === selectedFile.content && !isSaved}
                              className={`ml-auto mr-sm flex items-center gap-1 px-sm py-xs rounded-md text-[12px] font-medium transition-all ${
                                isSaved
                                  ? 'text-green-400 bg-green-500/10'
                                  : editedContent !== selectedFile.content
                                  ? 'text-primary bg-primary/10 hover:bg-primary/20 cursor-pointer'
                                  : 'text-on-surface-variant opacity-50 cursor-not-allowed'
                              }`}
                              title={editedContent !== selectedFile.content ? "Save (Ctrl+S)" : "No changes to save"}
                            >
                              <span className="material-symbols-outlined text-[15px]">{isSaved ? 'check_circle' : 'save'}</span>
                              <span>{isSaved ? 'Saved' : 'Save'}</span>
                            </button>
                          </div>
                          <div className="flex-1 flex overflow-hidden">
                              <div className="flex-1 flex font-code-md overflow-hidden" style={{ fontSize: `${editorFontSize}px`, lineHeight: 1.5 }}>
                                  {/* Line numbers */}
                                  <div className="w-12 bg-surface-container-lowest text-outline-variant text-right pr-sm py-md select-none border-r border-outline-variant/30 overflow-hidden shrink-0 pointer-events-none">
                                      {editedContent.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                                  </div>
                                  {/* Editable textarea */}
                                  <textarea
                                      value={editedContent}
                                      onChange={(e) => { setEditedContent(e.target.value); setIsSaved(false); }}
                                      spellCheck={false}
                                      className="flex-1 p-md overflow-auto bg-surface-container-lowest/30 whitespace-pre font-code-md resize-none outline-none border-none text-on-surface caret-primary"
                                      style={{ fontSize: `${editorFontSize}px`, lineHeight: 1.5, tabSize: 2 }}
                                  />
                              </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col bg-white overflow-hidden rounded-tl-lg">
                          {/* Browser address bar */}
                          <div className="h-10 bg-surface-container-highest/50 flex items-center px-md border-b border-outline-variant/20 text-on-surface shrink-0">
                            <div className="flex gap-2 mr-md">
                              <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                              <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                              <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                            </div>
                            <div className="bg-surface-container-lowest px-sm py-1 rounded-md text-[12px] font-code flex-1 flex items-center border border-outline-variant/10 shadow-inner max-w-md text-on-surface-variant">
                              <span className="material-symbols-outlined text-[14px] mr-sm opacity-50">lock</span>
                              http://localhost:5173
                            </div>
                          </div>
                          {/* Preview Iframe */}
                          <div className="flex-1 relative bg-white">
                            <iframe 
                              src="http://localhost:5173" 
                              className="absolute inset-0 w-full h-full border-none" 
                              title="Preview"
                              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                )}
              </div>
              
              {isAiPanelOpen && (
              <div 
                className="flex flex-col bg-surface-container-lowest/60 backdrop-blur-md border-l border-outline-variant/20 h-full shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.2)] z-20 relative"
                style={{ width: `${aiPanelWidth}px`, minWidth: `${aiPanelWidth}px` }}
              >
                {/* Resize handle */}
                <div 
                  className="absolute top-0 -left-1 w-2 h-full cursor-col-resize z-50 hover:bg-primary/50 transition-colors"
                  onMouseDown={handleMouseDown}
                ></div>

                <div className="h-12 px-md flex items-center justify-between border-b border-outline-variant/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">temp_preferences_custom</span>
                    <span className="font-label-caps text-[11px] tracking-wider text-on-surface font-semibold select-none">AI ASSISTANT</span>
                  </div>
                  <button onClick={() => setIsAiPanelOpen(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-[18px]">right_panel_close</span>
                  </button>
                </div>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-md flex flex-col gap-lg">
                    {(!messages || messages.length === 0) && (
                      <div className="flex gap-3 max-w-[90%]">
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-[16px]">temp_preferences_custom</span>
                        </div>
                        <div className="bg-surface-container p-3 rounded-2xl rounded-tl-sm border border-outline-variant/20 shadow-sm">
                          <p className="text-body-sm text-on-surface leading-relaxed">How can I help you with your application today?</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Optimistic user bubble — show step prompt immediately before DB loads */}
                    {initialPrompt && generateAiMutation.isPending && (!messages || messages.length === 0) && (
                      <div className="flex gap-3 max-w-[95%] self-end flex-row-reverse">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-surface-variant border-outline-variant/30">
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                        </div>
                        <div className="p-3 rounded-2xl shadow-sm border bg-primary/10 rounded-tr-sm border-primary/20 max-w-[85%]">
                          <p className="text-body-sm leading-relaxed text-primary-fixed-dim line-clamp-4">{initialPrompt}</p>
                        </div>
                      </div>
                    )}

                    {messages?.map((msg: any, i: number) => (
                      <React.Fragment key={i}>
                        {/* User Prompt Bubble — short label only */}
                        {msg.prompt && (
                          <div className="flex gap-3 max-w-[95%] self-end flex-row-reverse">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border bg-surface-variant border-outline-variant/30">
                              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                            </div>
                            <div className="p-3 rounded-2xl shadow-sm border bg-primary/10 rounded-tr-sm border-primary/20 max-w-[85%]">
                              <p className="text-body-sm leading-relaxed text-primary-fixed-dim line-clamp-3">{msg.prompt}</p>
                            </div>
                          </div>
                        )}
                        {/* AI Response — show summary card instead of raw XML */}
                        {msg.response && (
                          <AiResponseCard response={msg.response} />
                        )}
                      </React.Fragment>
                    ))}
                    {/* Thinking — only while isPending */}
                    {generateAiMutation.isPending && (
                        <div className="flex gap-3 max-w-[90%]">
                            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary text-[16px] animate-spin">progress_activity</span>
                            </div>
                            <div className="bg-surface-container p-3 rounded-2xl rounded-tl-sm border border-outline-variant/20 shadow-sm">
                                <p className="text-body-sm text-on-surface leading-relaxed">Thinking...</p>
                            </div>
                        </div>
                    )}

                    {/* Next Step Button */}
                    {isDone && plan && currentStep > 0 && currentStep < totalSteps && (
                        <div className="flex flex-col gap-sm p-sm bg-primary/5 rounded-xl border border-primary/20">
                            <div className="flex items-center gap-sm">
                                <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                                <p className="font-body-sm text-on-surface font-medium">Step {currentStep} of {totalSteps} complete!</p>
                            </div>
                            <button
                                onClick={() => {
                                    const nextStep = plan.steps.find((s: any) => s.number === currentStep + 1);
                                    if (nextStep) {
                                        const stepPrompt = `Execute Step ${nextStep.number}: ${nextStep.title}\n\n${nextStep.description}\n\nContext: This is part of the overall plan for: ${plan.originalPrompt}`;
                                        // Reset for next step
                                        initialPromptSent.current = false;
                                        setIsDone(false);
                                        navigate('/workspace', {
                                            state: {
                                                projectId,
                                                prompt: stepPrompt,
                                                plan,
                                                currentStep: nextStep.number,
                                                totalSteps,
                                            }
                                        });
                                    }
                                }}
                                className="flex items-center justify-center gap-sm px-md py-sm bg-primary text-on-primary font-body-sm font-medium rounded-lg shadow-sm hover:bg-primary-fixed-dim transition-all"
                            >
                                <span>Proceed with Step {currentStep + 1}</span>
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </div>
                    )}

                    {/* All steps done: env instructions + preview unlock notice */}
                    {isDone && plan && currentStep === totalSteps && (
                      <div className="flex flex-col gap-sm">
                        <div className="flex items-center gap-sm p-sm bg-green-500/10 rounded-xl border border-green-500/20">
                          <span className="material-symbols-outlined text-green-400 text-[18px]">task_alt</span>
                          <p className="font-body-sm text-on-surface font-medium">All {totalSteps} steps completed! 🎉</p>
                        </div>

                        {/* .env variables card */}
                        <EnvInstructionsCard files={files} />

                        {/* Preview unlock notice */}
                        <div className="flex items-center gap-sm p-sm bg-primary/5 rounded-xl border border-primary/20">
                          <span className="material-symbols-outlined text-primary text-[16px]">visibility</span>
                          <p className="font-body-sm text-on-surface">Preview is now <strong className="text-primary">unlocked</strong> — click the Preview tab above!</p>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>
                  
                  <div className="p-md border-t border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur">
                    <div className="flex items-center gap-sm bg-surface-container/80 px-4 py-2.5 rounded-xl border border-outline-variant/30 focus-within:border-primary/50 focus-within:bg-surface-container focus-within:shadow-[0_0_15px_rgba(173,198,255,0.1)] transition-all">
                      <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendPrompt(); }}
                        placeholder="Ask AI..." 
                        className="bg-transparent border-none outline-none text-body-sm flex-1 text-on-surface placeholder:text-on-surface-variant" 
                        disabled={generateAiMutation.isPending}
                      />
                      <button 
                        onClick={handleSendPrompt}
                        disabled={generateAiMutation.isPending || !prompt}
                        className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:bg-primary-fixed-dim transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              )}
              
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
