import React, { useState } from 'react';
import { Employee } from '../types';
import Logo from './Logo';
import { ShieldCheck, UserCheck, Key, Mail, Laptop, Shield, Play, HelpCircle, Check, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthScreenProps {
  employees: Employee[];
  onRegisterEmployee: (newEmp: Employee) => void;
  onLoginSuccess: (emp: Employee) => void;
}

export default function AuthScreen({ employees, onRegisterEmployee, onLoginSuccess }: AuthScreenProps) {
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

    </div>
  );
}
