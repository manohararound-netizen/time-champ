import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import Logo from './Logo';
import { ShieldCheck, UserCheck, Key, Mail, Laptop, Shield, Play, HelpCircle, Check, ArrowRight, Download, Terminal, Settings, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthScreenProps {
  employees: Employee[];
  onRegisterEmployee: (newEmp: Employee) => void;
  onLoginSuccess: (emp: Employee) => void;
  isDesktopAgentInstalled: boolean;
  onToggleDesktopAgent: (installed: boolean) => void;
}

export default function AuthScreen({ 
  employees, 
  onRegisterEmployee, 
  onLoginSuccess,
  isDesktopAgentInstalled,
  onToggleDesktopAgent
}: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'admin' | 'employee'>('employee');
  
  const adminExists = employees.some(emp => emp.isAdmin || emp.role === 'System Administrator');

  // Signup state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [employeeRole, setEmployeeRole] = useState('');
  const [rate, setRate] = useState('80');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Info Modal state for "How It Works"
  const [infoOpen, setInfoOpen] = useState(false);

  // Installer simulation states
  const [selectedOS, setSelectedOS] = useState<'windows' | 'macos' | 'linux'>('windows');
  const [showInstallerWizard, setShowInstallerWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [installProgress, setInstallProgress] = useState(0);
  const [wizardLogLines, setWizardLogLines] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleDownloadClient = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 25;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setDownloadProgress(100);
        setIsDownloading(false);
        
        const filename = selectedOS === 'windows' 
          ? 'TimeChamp-Desktop-Agent-Setup-v1.2.bat' 
          : selectedOS === 'macos' 
            ? 'TimeChamp-Desktop-Agent-v1.2.dmg' 
            : 'timechamp-desktop-agent-v1.2.deb';

        const content = `[Around29 TimeChamp Desktop Workspace Client v1.2.0]
Host Domain: around29.io
Inbound Sync Port: 3000
Sync Interval: 5 minutes (300 seconds)

This batch/script setup file activates the local workplace daemon.
Once installed and registered via the login portal, background window title focus checks will synchronize with your corporate timesheet metrics automatically.
Current Time: ${new Date().toISOString()}
Target Platform: ${selectedOS.toUpperCase()}
`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setDownloadProgress(currentProgress);
      }
    }, 150);
  };

  const handleRunInstaller = () => {
    setShowInstallerWizard(true);
    setWizardStep(1);
    setInstallProgress(0);
    setWizardLogLines(['Initializing setup launcher...']);
  };

  const startInstallationProgress = () => {
    setWizardStep(3);
    setInstallProgress(0);
    setWizardLogLines(['Starting extraction sequence...', 'Target: C:\\Program Files\\TimeChampAgent\\']);
    
    const logs = [
      'Extracting timechamp-daemon.exe...',
      'Validating system visual window hooks...',
      'Setting up 5-minute background polling triggers...',
      'Registering system daemon service...',
      'Configuring network socket loopback interface...',
      'Inbound connection handshake established (Port 2901)...',
      'Desktop Workstation Agent launched successfully. Listening for registered user session...'
    ];

    let logIndex = 0;
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setInstallProgress(100);
        setWizardStep(4);
        onToggleDesktopAgent(true); // Persists to App level state!
      } else {
        setInstallProgress(currentProgress);
        if (currentProgress > 0 && currentProgress % 15 === 0 && logIndex < logs.length) {
          setWizardLogLines(old => [...old, logs[logIndex]]);
          logIndex++;
        }
      }
    }, 80);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const isUserAdmin = role === 'admin';

    if (isUserAdmin) {
      const adminExists = employees.some(emp => emp.isAdmin || emp.role === 'System Administrator');
      if (adminExists) {
        setErrorMsg('An administrator account already exists. Only 1 can be as admin.');
        return;
      }
    }

    if (!name || !email || !passcode || (!isUserAdmin && !employeeRole)) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (employees.some(emp => emp.email.toLowerCase() === email.toLowerCase())) {
      setErrorMsg('An account with this email already exists.');
      return;
    }

    const newId = `AR29${Math.floor(1000 + Math.random() * 9000)}`;

    const newEmp: Employee & { password?: string; isAdmin?: boolean } = {
      id: newId,
      name,
      email,
      role: isUserAdmin ? 'System Administrator' : employeeRole,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&q=80&w=120&h=120`,
      hourlyRate: parseFloat(rate) || 80,
      productivityScore: 100,
      status: 'Active',
      totalHoursTracked: 0,
      password: passcode,
      isAdmin: isUserAdmin
    };

    onRegisterEmployee(newEmp);
    onLoginSuccess(newEmp);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail || !loginPass) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    // Check if default Manohar Donakonda
    if (loginEmail.toLowerCase() === 'manohar@around29.io' && loginPass === 'admin') {
      const defaultManohar = employees.find(emp => emp.id === 'AR29061') || employees[0];
      const adminManohar = { ...defaultManohar, isAdmin: true, password: 'admin' };
      onLoginSuccess(adminManohar);
      return;
    }

    const found = employees.find(
      emp => emp.email.toLowerCase() === loginEmail.toLowerCase()
    ) as Employee & { password?: string; isAdmin?: boolean };

    if (found) {
      // If signed up custom user, verify password. If initial seed user, allow login with matching email
      if (found.password && found.password !== loginPass) {
        setErrorMsg('Incorrect passcode/password.');
        return;
      }
      onLoginSuccess(found);
    } else {
      setErrorMsg('User account not found. Please sign up first.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-stretch font-sans" id="auth-portal-wrapper">
      
      {/* LEFT SIDE: DYNAMIC EXPLANATORY CLIENT DEPLOYMENT GRAPH */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-[#1d232a] to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Visual Background Glow matching Orange and Green */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#ff981a]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[#72bf24]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <Logo showText={true} className="h-10" />
        </div>

        <div className="z-10 space-y-8 my-auto max-w-lg">
          <div className="space-y-3">
            <span className="text-[#ff981a] text-xs font-black uppercase tracking-widest bg-[#ff981a]/15 px-3 py-1 rounded-full border border-[#ff981a]/30">
              Internal Enterprise Workspace
            </span>
            <h1 className="text-4xl font-black font-display tracking-tight leading-none text-white">
              Every 5 Minutes, Checked & Synchronized.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Around29's background workspace tracker runs locally on employees' computers, periodically auditing active window focus and active breaks to keep performance dashboards optimized.
            </p>
          </div>

          {/* Stepper of Client App and Data flow */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Software Installation & Data Flow</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-[#ff981a] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Install local Desktop Client</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Runs silently as a background service in Windows, Mac, or Linux systems.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-[#72bf24] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Continuous 5-Minute Auditing</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Evaluates active application names, open browser tabs, and idle break thresholds.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Cloud Database Sync</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Sends end-to-end encrypted logs to Around29 servers for unified payroll calculation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="z-10 flex items-center justify-between border-t border-slate-800/60 pt-6">
          <p className="text-[10px] text-slate-400 font-semibold">Around29 Chat & Tracker © 2026. All rights reserved.</p>
          <button 
            onClick={() => setInfoOpen(true)}
            className="text-xs font-extrabold text-[#72bf24] hover:text-[#5fa61d] flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Internal Tech Docs</span>
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: AUTHENTICATION INTERACTIVE CONTROL FORM */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 bg-white">
        
        <div className="mx-auto w-full max-w-sm space-y-6">
          
          <div className="space-y-2 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-4">
              <Logo showText={true} className="h-10" />
            </div>
            <h2 className="text-2xl font-black font-display tracking-tight text-slate-900">
              {mode === 'login' ? 'Log In to Around29' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'login' 
                ? 'Sign in using your corporate credentials to sync tracking logs' 
                : 'Register a new employee profile or administrator workspace'}
            </p>
          </div>

          {/* Desktop Workstation Agent Status Card & Installer Hub */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5" id="desktop-agent-setup-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-black uppercase text-slate-700 tracking-wider">Desktop Tracking Client</span>
              </div>
              {isDesktopAgentInstalled ? (
                <span className="text-[9px] text-[#72bf24] font-black bg-[#72bf24]/10 border border-[#72bf24]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#72bf24] animate-pulse" />
                  INSTALLED
                </span>
              ) : (
                <span className="text-[9px] text-red-500 font-black bg-red-50/70 border border-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  NOT DETECTED
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-normal font-medium">
              {isDesktopAgentInstalled 
                ? "The TimeChamp workstation daemon is installed & listening. Signup or login below to link this user and begin automated timesheet logging instantly!"
                : "A local desktop agent is required for automatic window-focus logs & active tracking. Download and simulate setup below."}
            </p>

            {!isDesktopAgentInstalled ? (
              <div className="space-y-3 pt-1">
                {/* OS selector pills */}
                <div className="grid grid-cols-3 bg-white p-0.5 rounded-lg border border-slate-150 text-[10px] font-bold text-slate-500">
                  <button 
                    type="button" 
                    onClick={() => setSelectedOS('windows')}
                    className={`py-1 rounded-md transition-all ${selectedOS === 'windows' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-50'}`}
                  >
                    Windows (.exe)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSelectedOS('macos')}
                    className={`py-1 rounded-md transition-all ${selectedOS === 'macos' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-50'}`}
                  >
                    macOS (.dmg)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSelectedOS('linux')}
                    className={`py-1 rounded-md transition-all ${selectedOS === 'linux' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-50'}`}
                  >
                    Linux (.deb)
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadClient}
                    disabled={isDownloading}
                    className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
                  >
                    {isDownloading ? (
                      <span className="flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
                        Downloading ({downloadProgress}%)
                      </span>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Agent</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRunInstaller}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-indigo-600/10"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Installer</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <div className="flex-1 bg-[#72bf24]/5 border border-[#72bf24]/10 rounded-xl p-2.5 flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-[#72bf24] animate-pulse shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-[#569319] uppercase tracking-wider">Daemon Status: ACTIVE</p>
                    <p className="text-[9px] text-slate-500 font-medium truncate">Port 2901 handshake ok. Awaiting registration.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleDesktopAgent(false)}
                  className="text-slate-400 hover:text-slate-600 text-[10px] font-bold border border-slate-200 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition-all shrink-0"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                         {/* Mode Switching for Registration Role */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Account Workspace Role</label>
                <div className="flex bg-slate-100 p-1 rounded-xl border">
                  <button
                    type="button"
                    onClick={() => setRole('employee')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'employee' 
                        ? 'bg-[#72bf24] text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Employee Space</span>
                  </button>
                  <button
                    type="button"
                    disabled={adminExists}
                    onClick={() => setRole('admin')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'admin' 
                        ? 'bg-[#ff981a] text-white shadow-xs' 
                        : adminExists
                          ? 'opacity-40 bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={adminExists ? "Administrator is already registered. Only 1 can be as admin." : ""}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Command</span>
                  </button>
                </div>
                {adminExists && (
                  <p className="text-[10px] text-amber-600 font-semibold mt-1">
                    * Admin Command is disabled because an administrator is already registered (Only 1 allowed).
                  </p>
                )}
              </div>
            )}

            {/* Fields */}
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Manohar Donakonda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-xl p-3 text-xs outline-hidden focus:ring-1 focus:ring-[#ff981a]"
                  />
                </div>

                {role === 'employee' && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Job Role Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lead Developer, UX Architect"
                      value={employeeRole}
                      onChange={(e) => setEmployeeRole(e.target.value)}
                      className="w-full border rounded-xl p-3 text-xs outline-hidden focus:ring-1 focus:ring-[#72bf24]"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@around29.io"
                  value={mode === 'login' ? loginEmail : email}
                  onChange={(e) => mode === 'login' ? setLoginEmail(e.target.value) : setEmail(e.target.value)}
                  className="w-full border rounded-xl pl-9 pr-3 py-3 text-xs outline-hidden focus:ring-1 focus:ring-[#ff981a]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Passcode / Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={mode === 'login' ? loginPass : passcode}
                  onChange={(e) => mode === 'login' ? setLoginPass(e.target.value) : setPasscode(e.target.value)}
                  className="w-full border rounded-xl pl-9 pr-3 py-3 text-xs outline-hidden focus:ring-1 focus:ring-[#ff981a]"
                />
              </div>
            </div>

            {/* Hourly Rate removed from all */}

            <button
              type="submit"
              className={`w-full text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer shadow-md ${
                role === 'admin' 
                  ? 'bg-[#ff981a] hover:bg-[#e08110] shadow-orange-500/10' 
                  : 'bg-[#72bf24] hover:bg-[#5fa61d] shadow-green-500/10'
              }`}
            >
              {mode === 'login' ? 'Log In to Workspace' : 'Create Account & Log In'}
            </button>
          </form>

          {/* Quick Demo Assist */}
          {mode === 'login' && (
            <div className="bg-slate-50 border rounded-xl p-3 text-[11px] text-slate-500 space-y-1">
              <p className="font-extrabold text-slate-700">💡 Quick Demo Login:</p>
              <p>Admin Email: <code className="font-bold text-slate-800">manohar@around29.io</code></p>
              <p>Admin Passcode: <code className="font-bold text-slate-800">admin</code></p>
            </div>
          )}

          {/* Switch Mode */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setMode(m => m === 'login' ? 'signup' : 'login');
                setErrorMsg('');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              {mode === 'login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Log in"}
            </button>
          </div>

        </div>
      </div>

      {/* TECH DOCS MODAL */}
      {infoOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl relative">
            <h3 className="text-lg font-black font-display text-slate-800">Internal Tech Specification & Compliance</h3>
            <p className="text-xs text-slate-500">
              This system is strictly configured for <strong>Around29 internal use</strong>. Below is the details on how data is logged, parsed, and persisted.
            </p>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border">
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff981a]" />
                  Active Client Daemon Process (Every 5 minutes)
                </h4>
                <p className="text-slate-500 mt-0.5">
                  The compiled Around29 app installs a native daemon listening on system events. On every 5-minute tick, it executes a process list snapshot, parses the active window title via OS APIs, and evaluates the work context.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#72bf24]" />
                  Security, Privacy, and Compliance
                </h4>
                <p className="text-slate-500 mt-0.5">
                  All active windows and idle metrics are formatted as static JSON chunks and cached locally. Once per 5 minutes, an HTTPS POST request is dispatched. Screenshots are only taken when enabled by the Admin under absolute project clearance.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  Active vs Coffee Break Detection
                </h4>
                <p className="text-slate-500 mt-0.5">
                  When a coffee break or lunch rest is started, window monitoring is suspended. Break thresholds are checked every 5 minutes to issue reminders or log overdue idle warnings.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => setInfoOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Got it, Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATED DESKTOP INSTALLER WIZARD OVERLAY */}
      {showInstallerWizard && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" id="install-wizard-modal">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl font-mono text-white">
            {/* Window title bar */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#ff981a]" />
                <span className="text-[11px] font-bold text-slate-300">TimeChamp Setup Wizard (v1.2)</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <button 
                  onClick={() => setShowInstallerWizard(false)} 
                  className="w-2.5 h-2.5 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer"
                  title="Close Setup"
                />
              </div>
            </div>

            {/* Step 1: Welcome & License */}
            {wizardStep === 1 && (
              <div className="p-6 space-y-4">
                <div className="text-center space-y-1.5">
                  <Laptop className="w-12 h-12 text-[#ff981a] mx-auto animate-bounce" />
                  <h3 className="text-sm font-black uppercase text-[#ff981a]">TimeChamp Workplace Daemon</h3>
                  <p className="text-[10px] text-slate-400">Desktop tracking agent installation client.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 h-32 overflow-y-auto text-[10px] text-slate-400 space-y-2 leading-relaxed">
                  <p className="font-bold text-slate-300">END USER COMPLIANCE & MONITORING DISCLOSURE</p>
                  <p>By installing this background client agent, you authorize Around29 Workplace systems to monitor and log active desktop window titles, open browser tab domains, and active break/idle times every 5 minutes.</p>
                  <p>This software strictly secures logs via end-to-end encryption. No keystrokes or private password details are parsed or logged.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowInstallerWizard(false)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setWizardStep(2)}
                    className="bg-[#72bf24] hover:bg-[#5fa61d] text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    I Agree & Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Installation Path Selection */}
            {wizardStep === 2 && (
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-300">Select Installation Folder:</h4>
                  <p className="text-[10px] text-slate-500">Setup will install files in the following secure workspace folder:</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs font-semibold text-[#ff981a]">
                  <span>{selectedOS === 'windows' ? 'C:\\Program Files\\TimeChampAgent' : selectedOS === 'macos' ? '/Applications/TimeChampAgent.app' : '/usr/bin/timechamp-agent'}</span>
                  <span className="text-[9px] text-slate-500 font-mono">14.2 MB required</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={startInstallationProgress}
                    className="bg-[#ff981a] hover:bg-[#e08110] text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Install Now
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Installation Progress & Terminal Console logs */}
            {wizardStep === 3 && (
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>Extracting workstation assets...</span>
                    <span className="text-[#72bf24] font-mono">{installProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff981a] via-[#00a3a4] to-[#72bf24] rounded-full transition-all duration-75"
                      style={{ width: `${installProgress}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl h-36 overflow-y-auto flex flex-col justify-end text-[10px] font-mono text-slate-400 space-y-1">
                  {wizardLogLines.map((line, idx) => (
                    <p key={idx} className={idx === wizardLogLines.length - 1 ? 'text-[#72bf24] font-bold animate-pulse' : 'text-slate-500'}>
                      $ {line}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Success Notification */}
            {wizardStep === 4 && (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#72bf24]/20 border border-[#72bf24]/40 flex items-center justify-center mx-auto text-[#72bf24] animate-bounce">
                  <Check className="w-6 h-6" />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-[#72bf24] uppercase tracking-wider">Installation Complete!</h3>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    The TimeChamp background daemon service has been successfully registered in your local operating system startup script.
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl text-left text-[10px] space-y-1 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold mb-1">
                    <Activity className="w-3.5 h-3.5 text-[#72bf24] animate-pulse" />
                    <span>Background Daemon Live Connection</span>
                  </div>
                  <p className="text-slate-500">Service: <strong className="text-slate-400">timechamp-agent-daemon</strong></p>
                  <p className="text-slate-500">Next Action: <strong className="text-slate-300">Sign up or Log in</strong> to start auto-tracking timesheets.</p>
                </div>

                <button
                  onClick={() => setShowInstallerWizard(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 w-full rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Close & Continue Setup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
