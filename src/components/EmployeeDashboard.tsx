import React, { useState, useEffect } from 'react';
import { Employee, Project, TaskSession, BreakLog, TimeClaim } from '../types';
import { 
  Clock, 
  TrendingUp, 
  Coffee, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Send, 
  Laptop, 
  Calendar, 
  Zap, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmployeeDashboardProps {
  currentEmployee: Employee;
  sessions: TaskSession[];
  breaks: BreakLog[];
  claims: TimeClaim[];
  onSubmitClaim: (projectId: string, taskName: string, date: string, hours: number, reason: string) => void;
  projects: Project[];
}

export default function EmployeeDashboard({
  currentEmployee,
  sessions,
  breaks,
  claims,
  onSubmitClaim,
  projects
}: EmployeeDashboardProps) {
  const [countdown, setCountdown] = useState(300); // 5 min countdown
  const [agentActive, setAgentActive] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'agent' | 'user'; text: string; time: string }>>([
    { 
      sender: 'agent', 
      text: 'Hi मनोहर Donakonda! I am the Around29 Chat Assistant. I monitor active system windows and active breaks every 5 minutes to keep our work environment optimized. How can I assist you today?', 
      time: '09:00 AM' 
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  // Form States for quick claim
  const [claimProjectId, setClaimProjectId] = useState(projects[0]?.id || '');
  const [claimTaskName, setClaimTaskName] = useState('');
  const [claimDate, setClaimDate] = useState('2026-07-07');
  const [claimHours, setClaimHours] = useState('2');
  const [claimReason, setClaimReason] = useState('');
  const [claimSuccessMessage, setClaimSuccessMessage] = useState('');

  // Keeps 5 min sync ticker going
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 300 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSecs = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Chat message submit
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = { sender: 'user' as const, text: inputVal.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    const text = inputVal.toLowerCase();
    setInputVal('');

    setTimeout(() => {
      let botResponse = "I can log that for you. Remember that our background desktop sync agent checks open windows and active breaks every 5 minutes to update your performance dashboards.";
      if (text.includes('sync') || text.includes('monitor') || text.includes('open') || text.includes('track')) {
        botResponse = "The Around29 desktop agent captures active applications (like VS Code, Chrome tabs) every 5 minutes. If a non-work tab is open, it reminds you to shift focus.";
      } else if (text.includes('break') || text.includes('lunch') || text.includes('coffee')) {
        botResponse = "When you click 'Start Break' in the portal, tracking is paused. Active break limits are monitored every 5 minutes. Coffee breaks are limited to 15 mins and Lunch to 60 mins.";
      } else if (text.includes('hours') || text.includes('claim')) {
        botResponse = "To submit a manual time claim, use the 'Quick Offline Work Claim' form right on your dashboard! Once submitted, it appears on the administrator's review page immediately.";
      } else if (text.includes('rate') || text.includes('salary') || text.includes('money')) {
        botResponse = `For payment and salary details, please consult your administrator. You can review your verified logs on the portal anytime.`;
      }

      setMessages(prev => [...prev, {
        sender: 'agent',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 850);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimProjectId || !claimReason || !claimHours) return;
    onSubmitClaim(claimProjectId, claimTaskName || 'Offline Support', claimDate, parseFloat(claimHours), claimReason);
    setClaimSuccessMessage('Offline time claim submitted successfully! Awaiting Admin approval.');
    setClaimReason('');
    setClaimTaskName('');
    setTimeout(() => setClaimSuccessMessage(''), 4500);
  };

  // Filter personal sessions and claims
  const personalSessions = sessions.filter(s => s.employeeId === currentEmployee.id);
  const personalClaims = claims.filter(c => c.employeeId === currentEmployee.id);
  const personalBreaks = breaks.filter(b => b.employeeId === currentEmployee.id);

  // Stats
  const hoursThisWeek = personalSessions.reduce((acc, curr) => acc + (curr.durationSeconds / 3600), 0);
  const activeBreakObj = breaks.find(b => b.employeeId === currentEmployee.id && b.endTime === null);

  return (
    <div className="space-y-6" id="employee-dashboard-viewport">
      
      {/* PERSONAL BANNER */}
      <div className="bg-gradient-to-r from-slate-900 to-[#1d232a] text-white rounded-2xl p-6 border border-slate-700/60 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff981a]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-12 w-24 h-24 bg-[#72bf24]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center space-x-4">
            <img 
              src={currentEmployee.avatar} 
              alt={currentEmployee.name} 
              className="w-16 h-16 rounded-xl object-cover border-2 border-white/10 shadow-lg"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-[10px] text-[#ff981a] font-extrabold uppercase tracking-widest bg-[#ff981a]/10 px-2.5 py-1 rounded-full border border-[#ff981a]/20">
                Employee Portal
              </span>
              <h2 className="text-xl font-black font-display text-white mt-1.5">{currentEmployee.name}</h2>
              <p className="text-xs text-slate-300 font-medium">{currentEmployee.role} • Employee ID: {currentEmployee.id}</p>
            </div>
          </div>

          {/* ACTIVE DESKTOP AGENT COMPLIANCE PANEL (CHECKED EVERY 5 MINS) */}
          <div className="bg-slate-950/80 border border-slate-700/50 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#72bf24] animate-pulse" />
                <p className="text-xs font-extrabold text-[#72bf24] uppercase tracking-wide">Sync Agent Active</p>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Capture interval: Every 5 minutes</p>
            </div>
            <span className="hidden md:block h-8 w-[1.5px] bg-slate-700" />
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Next System Snapshot</p>
              <p className="text-sm font-mono font-black text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#ff981a] animate-spin" />
                {formatSecs(countdown)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="employee-stats-grid">
        
        {/* Hours Logged */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Tracked Hours</span>
              <h3 className="text-2xl font-black text-slate-800 font-mono mt-1">
                {(currentEmployee.totalHoursTracked + hoursThisWeek).toFixed(1)}h
              </h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#ff981a] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-2.5">
            Including {hoursThisWeek.toFixed(1)}h logged during current active sessions
          </p>
        </div>

        {/* Productivity Score */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Productivity Score</span>
              <h3 className="text-2xl font-black text-[#72bf24] font-mono mt-1">
                {currentEmployee.productivityScore}%
              </h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-green-50 text-[#72bf24] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-[#72bf24] font-bold mt-2.5">
            ✓ Top 5% organization productivity rating
          </p>
        </div>

        {/* Breaks Taken */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Breaks Registered</span>
              <h3 className="text-2xl font-black text-slate-800 font-mono mt-1">
                {personalBreaks.length} Session{personalBreaks.length !== 1 ? 's' : ''}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-2.5">
            {activeBreakObj ? '⚠️ Currently taking an Active Break' : '✓ All breaks checked & synchronized'}
          </p>
        </div>

      </div>

      {/* CORE FUNCTIONAL PANELS: ACTIVE SYSTEM MONITOR & CLAIM FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monitored System Status (Left Column, 7 Grid Span) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 font-display">System Status & Active Monitored Windows</h3>
            <p className="text-xs text-slate-400">This lists what is currently being logged on your computer by our 5-minute sync service.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Active Desktop Client:</span>
              <span className="bg-[#72bf24]/10 text-[#72bf24] text-[10px] font-black px-2 py-0.5 rounded-md border border-[#72bf24]/20">
                Connected
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 uppercase font-extrabold">Primary Active Process</p>
              <div className="flex items-center justify-between bg-white border rounded-xl p-3 shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ff981a] flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">Chrome Browser</h4>
                    <p className="text-[10px] text-slate-500 font-medium truncate max-w-[250px] sm:max-w-[320px]">
                      Active tab: Around29 Chat Developer Workspace
                    </p>
                  </div>
                </div>
                <span className="bg-green-50 text-[#72bf24] text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100">
                  Productive
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-semibold">Today's System Sweep Accuracy:</span>
                <span className="font-bold text-[#72bf24]">98.4%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#72bf24] h-full" style={{ width: '98.4%' }} />
              </div>
            </div>
          </div>

          {/* Active warnings or info */}
          <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-3.5 flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 text-[#ff981a] flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Break & Activity Monitoring Note:</strong> Taking a break? Make sure to trigger <strong>"Start Break"</strong> in the Breaks & Claims menu. Active breaks are verified automatically every 5 minutes. If no movement is logged without a break status, a passive warning is recorded.
            </div>
          </div>

          <div className="pt-2 border-t flex items-center justify-between">
            <p className="text-[10px] text-slate-400 font-semibold">Need the background daemon client?</p>
            <button className="text-xs font-extrabold text-[#ff981a] hover:text-[#e08110] flex items-center gap-1 cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Download Around29 Client</span>
            </button>
          </div>
        </div>

        {/* Quick Claims form (Right Column, 5 Grid Span) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 font-display">Quick Offline Work Claim</h3>
            <p className="text-xs text-slate-400">Submit a claim for offline meetings or on-site client deployments.</p>
          </div>

          <form onSubmit={handleClaimSubmit} className="space-y-3 mt-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Project</label>
              <select
                value={claimProjectId}
                onChange={(e) => setClaimProjectId(e.target.value)}
                className="w-full text-xs border rounded-lg p-2 bg-white focus:ring-1 focus:ring-[#ff981a] outline-hidden"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.clientName})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Date</label>
                <input
                  type="date"
                  value={claimDate}
                  onChange={(e) => setClaimDate(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-[#ff981a] outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Hours Claimed</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={claimHours}
                  onChange={(e) => setClaimHours(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-[#ff981a] outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Task Details</label>
              <input
                type="text"
                placeholder="e.g. Onsite deployment session with Aether Corp"
                value={claimTaskName}
                onChange={(e) => setClaimTaskName(e.target.value)}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-[#ff981a] outline-hidden"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Detailed Reason</label>
              <textarea
                rows={2}
                placeholder="Describe why hours could not be tracked with the desktop client agent..."
                value={claimReason}
                onChange={(e) => setClaimReason(e.target.value)}
                className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-[#ff981a] outline-hidden"
                required
              />
            </div>

            {claimSuccessMessage && (
              <p className="text-[10px] font-bold text-green-600 bg-green-50 p-2 border border-green-200 rounded-lg">
                {claimSuccessMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#ff981a] hover:bg-[#e08110] text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer text-center"
            >
              Submit Claim
            </button>
          </form>
        </div>

      </div>

      {/* RECENT TIME CLAIMS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-800 font-display">My Historical Hour Claims ({personalClaims.length})</h3>
        <p className="text-xs text-slate-400 mb-4">View and track approval of submitted offline hour claims</p>

        <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
          {personalClaims.length > 0 ? (
            personalClaims.map((claim) => (
              <div key={claim.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800">{claim.projectName}</span>
                    <span className="text-[10px] text-slate-400 font-medium font-mono">{claim.date}</span>
                  </div>
                  <p className="text-slate-500 font-medium mt-0.5">{claim.taskName} — <span className="italic">"{claim.reason}"</span></p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-800 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">
                    {claim.hours} hrs
                  </span>

                  {claim.status === 'Approved' ? (
                    <span className="bg-green-50 text-[#72bf24] border border-green-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Approved
                    </span>
                  ) : claim.status === 'Rejected' ? (
                    <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1" title={claim.rejectionReason}>
                      <ShieldAlert className="w-3.5 h-3.5" /> Rejected
                    </span>
                  ) : (
                    <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                      Awaiting Admin Review
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic py-4">No historical claims recorded. All your hours have been logged dynamically via the background sync daemon!</p>
          )}
        </div>
      </div>

    </div>
  );
}
