import React, { useState, useEffect } from 'react';
import { Employee, Project, BreakLog, TimeClaim } from '../types';
import { 
  Coffee, 
  LogOut, 
  LogIn, 
  Clock, 
  Send, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User,
  Plus,
  Play,
  FileText,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MyBreakroomAndClaimsProps {
  employees: Employee[];
  projects: Project[];
  currentEmployeeId: string | null;
  onLogin: (employeeId: string) => void;
  onLogout: () => void;
  breaks: BreakLog[];
  onStartBreak: (employeeId: string, type: string) => void;
  onEndBreak: () => void;
  activeBreak: BreakLog | null;
  claims: TimeClaim[];
  onSubmitClaim: (projectId: string, taskName: string, date: string, hours: number, reason: string) => void;
}

export default function MyBreakroomAndClaims({
  employees,
  projects,
  currentEmployeeId,
  onLogin,
  onLogout,
  breaks,
  onStartBreak,
  onEndBreak,
  activeBreak,
  claims,
  onSubmitClaim,
}: MyBreakroomAndClaimsProps) {
  // Login view states
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  
  // Claim form states
  const [claimProjectId, setClaimProjectId] = useState<string>('');
  const [claimTaskName, setClaimTaskName] = useState<string>('');
  const [claimDate, setClaimDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [claimHours, setClaimHours] = useState<string>('8.0');
  const [claimReason, setClaimReason] = useState<string>('');
  const [claimError, setClaimError] = useState<string>('');
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);
  const [claimStartTime, setClaimStartTime] = useState<string>('09:00');
  const [claimEndTime, setClaimEndTime] = useState<string>('17:00');

  // Automatically calculate hours claimed dynamically when typed start/end times change
  useEffect(() => {
    if (!claimStartTime || !claimEndTime) return;
    const [startH, startM] = claimStartTime.split(':').map(Number);
    const [endH, endM] = claimEndTime.split(':').map(Number);
    if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
      let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
      if (diffMins < 0) {
        diffMins += 24 * 60; // handle overflow
      }
      const calculatedHours = Math.round((diffMins / 60) * 100) / 100;
      setClaimHours(calculatedHours.toString());
    }
  }, [claimStartTime, claimEndTime]);

  // Break state and local stopwatch
  const [breakType, setBreakType] = useState<string>('Coffee Break');
  const [breakSeconds, setBreakSeconds] = useState<number>(0);

  // Find active logged in employee
  const currentEmployee = employees.find(e => e.id === currentEmployeeId);

  // Sync and tick local break timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeBreak) {
      const startMs = new Date(activeBreak.startTime).getTime();
      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - startMs) / 1000);
        setBreakSeconds(elapsed > 0 ? elapsed : 0);
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setBreakSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeBreak]);

  // Handle setting default project for the claim
  useEffect(() => {
    if (projects.length > 0 && !claimProjectId) {
      setClaimProjectId(projects[0].id);
    } else if (!claimProjectId) {
      setClaimProjectId('default');
    }
  }, [projects, claimProjectId]);

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = selectedEmpId || (employees.length > 0 ? employees[0].id : '');
    if (targetId) {
      onLogin(targetId);
    }
  };

  // Handle Claim Submission
  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError('');
    setClaimSuccess(false);

    if (!claimTaskName.trim()) {
      setClaimError('Please provide a specific task activity or description of work.');
      return;
    }
    if (!claimDate) {
      setClaimError('Please specify a valid claim date.');
      return;
    }
    const hrs = parseFloat(claimHours);
    if (isNaN(hrs) || hrs <= 0 || hrs > 24) {
      setClaimError('Hours claimed must be between 0.1 and 24 hours.');
      return;
    }
    if (!claimReason.trim()) {
      setClaimError('Please provide a short justification or summary of work.');
      return;
    }

    onSubmitClaim(claimProjectId || 'default', claimTaskName.trim(), claimDate, hrs, claimReason.trim());
    setClaimSuccess(true);
    setClaimReason('');
    setClaimHours('8');
    
    // Clear success message after 4s
    setTimeout(() => {
      setClaimSuccess(false);
    }, 4000);
  };

  const formatSeconds = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter logs for this specific logged in employee
  const myBreaks = breaks.filter(b => b.employeeId === currentEmployeeId);
  const myClaims = claims.filter(c => c.employeeId === currentEmployeeId);

  // If NOT LOGGED IN, show a beautiful, welcoming Login Screen
  if (!currentEmployeeId || !currentEmployee) {
    return (
      <div className="max-w-md mx-auto" id="login-form-container">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mx-auto text-indigo-600">
              <LogIn className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-display">Employee Portal Login</h3>
            <p className="text-xs text-slate-400">Select your profile to manage active breaks, timesheet adjustments, and claim hours</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Select Your Profile
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                id="portal-login-select"
              >
                <option value="" disabled>-- Choose Your Name --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
              id="portal-login-submit-btn"
            >
              <LogIn className="w-4 h-4" /> Sign In to Portal
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 italic">
              Once signed in, you can activate the break clock or file manual off-site logs for validation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN VIEW: Show workspace for active employee
  return (
    <div className="space-y-8" id="employee-workspace">
      {/* Employee Profile Header Banner */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={currentEmployee.avatar} 
              alt={currentEmployee.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-100 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
              currentEmployee.status === 'Break' ? 'bg-amber-500' :
              currentEmployee.status === 'Active' ? 'bg-indigo-500' : 'bg-slate-300'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-800 font-display">{currentEmployee.name}</h3>
            </div>
            <p className="text-xs text-slate-400">{currentEmployee.role}</p>
            <p className="text-xs text-indigo-600 font-medium mt-1 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${
                currentEmployee.status === 'Break' ? 'bg-amber-500' :
                currentEmployee.status === 'Active' ? 'bg-indigo-500' : 'bg-slate-400'
              }`} />
              Current Status: {currentEmployee.status === 'Break' ? 'On Break' : currentEmployee.status}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-50 border border-slate-150 px-4 py-2.5 rounded-xl text-center md:text-right">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Total Hours Tracked</span>
            <span className="text-sm font-bold font-mono text-slate-800">{currentEmployee.totalHoursTracked.toFixed(1)}h</span>
          </div>
          <button
            onClick={onLogout}
            className="border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 bg-white hover:bg-red-50/50 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            id="portal-logout-btn"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Breaks Center (5/12 span) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <Coffee className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 font-display">Breaks & Rest intervals</h4>
                <p className="text-[11px] text-slate-400">Track Coffee, Lunch, or rest states accurately</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeBreak ? (
                /* ACTIVE BREAK SUB-PANEL */
                <motion.div 
                  key="active-break"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 text-center space-y-4"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-700 animate-pulse">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-amber-100 border border-amber-200 text-amber-800 uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">
                      {activeBreak.type}
                    </span>
                    <h5 className="text-sm font-semibold text-slate-800 mt-2">Active Break Timer</h5>
                    <p className="text-xs text-slate-400 mt-0.5">Started at {new Date(activeBreak.startTime).toLocaleTimeString()}</p>
                  </div>
                  
                  <div className="text-4xl font-extrabold font-mono text-amber-700 tracking-wider">
                    {formatSeconds(breakSeconds)}
                  </div>

                  <button
                    onClick={onEndBreak}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    id="end-break-btn"
                  >
                    <Play className="w-3.5 h-3.5 rotate-90 fill-white" /> End Break & Resume Work
                  </button>
                </motion.div>
              ) : (
                /* INACTIVE BREAK Form */
                <motion.div 
                  key="inactive-break"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Select Break Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Coffee Break', 'Lunch Break', 'Short Rest', 'Personal Break'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setBreakType(type)}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                            breakType === type
                              ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onStartBreak(currentEmployeeId, breakType)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    id="start-break-btn"
                  >
                    <Coffee className="w-4 h-4" /> Take a Break Now
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* BREAKS HISTORY LOG */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Rest Session History</h5>
              {myBreaks.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50/50 rounded-lg">
                  No breaks recorded today.
                </p>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {myBreaks.map(b => (
                    <div key={b.id} className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-700 flex items-center gap-1">
                          <Coffee className="w-3 h-3 text-slate-400" /> {b.type}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(b.startTime).toLocaleTimeString()}
                          {b.endTime ? ` - ${new Date(b.endTime).toLocaleTimeString()}` : ' (Running)'}
                        </p>
                      </div>
                      <span className="font-mono text-slate-600 font-semibold bg-white border border-slate-150 px-1.5 py-0.5 rounded-md text-[10px]">
                        {b.endTime ? formatSeconds(b.durationSeconds) : 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Time Claim Portal (7/12 span) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SUBMIT CLAIM CARD */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 font-display">Off-Site & Manual Time Claims</h4>
                  <p className="text-[11px] text-slate-400">Submit off-site, overtime or manual hours for manager authorization</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              {claimError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{claimError}</span>
                </div>
              )}

              {claimSuccess && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-indigo-600" />
                  <span>Your hour adjustment claim has been submitted to management.</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {/* Task Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Activity Task / Description of Work
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Client Consultation, Server Maintenance, Code Review, Off-site Setup"
                    value={claimTaskName}
                    onChange={(e) => setClaimTaskName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-semibold text-slate-800"
                    id="claim-task-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Claim Date
                  </label>
                  <input
                    type="date"
                    value={claimDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setClaimDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-mono"
                    id="claim-date-input"
                  />
                </div>

                {/* Hour Quota */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Hours to Claim
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="24"
                    value={claimHours}
                    onChange={(e) => setClaimHours(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-mono font-bold"
                    id="claim-hours-input"
                  />
                </div>
              </div>

              {/* Dynamic Typed Time Section */}
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dynamic Hour Calculator</span>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">
                    {claimHours} Hours Calculated
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Typed Start Time</label>
                    <input 
                      type="time"
                      value={claimStartTime}
                      onChange={(e) => setClaimStartTime(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white focus:ring-1 focus:ring-indigo-500 outline-hidden font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Typed End Time</label>
                    <input 
                      type="time"
                      value={claimEndTime}
                      onChange={(e) => setClaimEndTime(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white focus:ring-1 focus:ring-indigo-500 outline-hidden font-semibold"
                    />
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 italic">
                  Change these typed times to dynamically update the calculated claimed hours above.
                </p>
              </div>

              {/* Justification Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Business Justification Notes
                </label>
                <textarea
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  placeholder="e.g., Client consultation onsite at Orion Labs, network setup support, or approved overtime session..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  id="claim-reason-textarea"
                />
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                id="submit-claim-btn"
              >
                <Send className="w-3.5 h-3.5" /> Submit Adjustment Claim
              </button>
            </form>
          </div>

          {/* MY CLAIMS STATUS LIST */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h5 className="text-xs font-bold text-slate-800 font-display">My Claimed Hour Statuses ({myClaims.length})</h5>
            {myClaims.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8 bg-slate-50/50 rounded-lg">
                No timesheet claims filed yet. Use the form above to claim hours.
              </p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {myClaims.map(c => (
                  <div key={c.id} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <h6 className="text-xs font-bold text-slate-800">
                          {c.projectName} &rsaquo; <span className="text-slate-500 font-normal">{c.taskName}</span>
                        </h6>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Date of Work: {c.date} • Filed on {new Date(c.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="font-mono text-xs font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-150">
                          {c.hours.toFixed(1)}h
                        </span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                          c.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          c.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {c.status === 'Approved' && <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />}
                          {c.status === 'Rejected' && <XCircle className="w-2.5 h-2.5 text-red-600" />}
                          {c.status === 'Pending' && <Clock className="w-2.5 h-2.5 text-amber-600 animate-spin" />}
                          {c.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-white border border-slate-100 p-2 rounded-lg italic">
                      "{c.reason}"
                    </p>

                    {c.status === 'Rejected' && c.rejectionReason && (
                      <div className="text-[11px] text-red-700 bg-red-50 border border-red-100 p-2 rounded-lg flex gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase tracking-wider">Manager Note:</span> {c.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
