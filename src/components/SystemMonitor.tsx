import React, { useState, useEffect } from 'react';
import { Employee, TaskSession, BreakLog } from '../types';
import { 
  Laptop, 
  Clock, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  History, 
  Activity, 
  RefreshCw, 
  Play, 
  Layers, 
  Compass, 
  ExternalLink,
  Filter,
  Sliders,
  BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SystemMonitorProps {
  employees: Employee[];
  sessions: TaskSession[];
  breaks: BreakLog[];
}

// Interface for simulated 5-minute system snapshots
interface SystemSnapshot {
  id: string;
  employeeId: string;
  employeeName: string;
  timestamp: string; // "10:55 AM" style or dynamic relative time
  activeApp: string;
  activeWindowDetails: string;
  isProductive: boolean;
  category: 'Development' | 'Communication' | 'Design' | 'Entertainment' | 'Browsing' | 'Idle' | 'Break';
}

const INITIAL_SNAPSHOTS: SystemSnapshot[] = [
  // Manohar Donakonda
  {
    id: 'snap-1',
    employeeId: 'AR29061',
    employeeName: 'Manohar Donakonda',
    timestamp: '08:55 AM',
    activeApp: 'Chrome (Around29 Chat)',
    activeWindowDetails: 'Around29 - Workspace Chat Thread #design',
    isProductive: true,
    category: 'Communication'
  },
  {
    id: 'snap-2',
    employeeId: 'AR29061',
    employeeName: 'Manohar Donakonda',
    timestamp: '08:50 AM',
    activeApp: 'VS Code',
    activeWindowDetails: 'server.ts - Nova Redesign API Layer',
    isProductive: true,
    category: 'Development'
  },
  {
    id: 'snap-3',
    employeeId: 'AR29061',
    employeeName: 'Manohar Donakonda',
    timestamp: '08:45 AM',
    activeApp: 'Slack',
    activeWindowDetails: '#general - Product Backlog grooming',
    isProductive: true,
    category: 'Communication'
  },
  {
    id: 'snap-4',
    employeeId: 'AR29061',
    employeeName: 'Manohar Donakonda',
    timestamp: '08:40 AM',
    activeApp: 'Figma',
    activeWindowDetails: 'Nova Redesign V5 Mockups - Main Roster',
    isProductive: true,
    category: 'Design'
  },
  {
    id: 'snap-5',
    employeeId: 'AR29061',
    employeeName: 'Manohar Donakonda',
    timestamp: '08:35 AM',
    activeApp: 'Chrome (GitHub)',
    activeWindowDetails: 'around29-org/core-tracker Pull Requests',
    isProductive: true,
    category: 'Development'
  },

  // Sarah Chen
  {
    id: 'snap-s1',
    employeeId: 'emp-1',
    employeeName: 'Sarah Chen',
    timestamp: '08:55 AM',
    activeApp: 'Figma',
    activeWindowDetails: 'Design System V2 - Typography Grid',
    isProductive: true,
    category: 'Design'
  },
  {
    id: 'snap-s2',
    employeeId: 'emp-1',
    employeeName: 'Sarah Chen',
    timestamp: '08:50 AM',
    activeApp: 'Chrome (YouTube)',
    activeWindowDetails: 'Lo-Fi Chill Beats for Designing 24/7',
    isProductive: false,
    category: 'Entertainment'
  },
  {
    id: 'snap-s3',
    employeeId: 'emp-1',
    employeeName: 'Sarah Chen',
    timestamp: '08:45 AM',
    activeApp: 'Figma',
    activeWindowDetails: 'Interactive Prototyping - Transition Curves',
    isProductive: true,
    category: 'Design'
  },

  // Alex Rivera
  {
    id: 'snap-a1',
    employeeId: 'emp-2',
    employeeName: 'Alex Rivera',
    timestamp: '08:55 AM',
    activeApp: 'VS Code',
    activeWindowDetails: 'App.tsx - Integrating Redux State Stores',
    isProductive: true,
    category: 'Development'
  },
  {
    id: 'snap-a2',
    employeeId: 'emp-2',
    employeeName: 'Alex Rivera',
    timestamp: '08:50 AM',
    activeApp: 'Chrome (StackOverflow)',
    activeWindowDetails: 'How to fix React 18 strict mode re-render issue',
    isProductive: true,
    category: 'Browsing'
  },
  {
    id: 'snap-a3',
    employeeId: 'emp-2',
    employeeName: 'Alex Rivera',
    timestamp: '08:45 AM',
    activeApp: 'Chrome (Netflix)',
    activeWindowDetails: 'Sci-Fi Space Documentaries - Season 1 EP 3',
    isProductive: false,
    category: 'Entertainment'
  },

  // Marcus Vance
  {
    id: 'snap-m1',
    employeeId: 'emp-3',
    employeeName: 'Marcus Vance',
    timestamp: '08:55 AM',
    activeApp: 'Terminal (bash)',
    activeWindowDetails: 'tail -f /var/log/nginx/access.log',
    isProductive: true,
    category: 'Development'
  },
  {
    id: 'snap-m2',
    employeeId: 'emp-3',
    employeeName: 'Marcus Vance',
    timestamp: '08:50 AM',
    activeApp: 'Chrome (ChatGPT)',
    activeWindowDetails: 'Generate SQL index optimizations for heavy joins',
    isProductive: true,
    category: 'Browsing'
  },
  {
    id: 'snap-m3',
    employeeId: 'emp-3',
    employeeName: 'Marcus Vance',
    timestamp: '08:45 AM',
    activeApp: 'Idle System State',
    activeWindowDetails: 'Screen Locked - No keyboard/mouse movement detected',
    isProductive: false,
    category: 'Idle'
  }
];

export default function SystemMonitor({ employees, sessions, breaks }: SystemMonitorProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [snapshots, setSnapshots] = useState<SystemSnapshot[]>(() => {
    const saved = localStorage.getItem('timechamp_system_snapshots');
    return saved ? JSON.parse(saved) : INITIAL_SNAPSHOTS;
  });

  // Countdown timer for 5-minute background sweep cycle
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 mins in seconds
  const [totalScansCount, setTotalScansCount] = useState(12);
  const [filterType, setFilterType] = useState<'all' | 'productive' | 'unproductive'>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('timechamp_system_snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  // Handle 5-minute tracking sweep ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Trigger automatic 5-minute sampling update
          handlePeriodicBackgroundSweep();
          return 300; // Reset to 5 mins
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [snapshots]);

  // Format MM:SS
  const formatCountdown = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Run the 5-minute system and break check
  const handlePeriodicBackgroundSweep = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // Pick a random employee and assign a new 5-minute snapshot
      const randomEmp = employees[Math.floor(Math.random() * employees.length)];
      
      const productivityApps = [
        { app: 'VS Code', details: 'index.css - Aligning CSS grid layout', cat: 'Development', prod: true },
        { app: 'Chrome (Around29 Chat)', details: 'Around29 Chat - Direct Message discussion', cat: 'Communication', prod: true },
        { app: 'Figma', details: 'Asset manager mockup V4', cat: 'Design', prod: true },
        { app: 'Terminal', details: 'docker-compose up --build core-service', cat: 'Development', prod: true },
        { app: 'Chrome (LeetCode)', details: '3 Sum Closest Problem - JavaScript solutions', cat: 'Development', prod: true }
      ];

      const distractionApps = [
        { app: 'Chrome (YouTube)', details: 'Best Coding Music Mix 2026 Live', cat: 'Entertainment', prod: false },
        { app: 'Chrome (Reddit)', details: 'r/reactjs - What are your thoughts on Server Actions?', cat: 'Browsing', prod: false },
        { app: 'Chrome (Facebook)', details: 'News Feed & Chat messages', cat: 'Browsing', prod: false },
        { app: 'Idle System State', details: 'No user input detected (Idle > 5m)', cat: 'Idle', prod: false }
      ];

      const selectedList = Math.random() > 0.35 ? productivityApps : distractionApps;
      const appChoice = selectedList[Math.floor(Math.random() * selectedList.length)];

      const now = new Date();
      const timestampString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newSnapshot: SystemSnapshot = {
        id: `snap-${Date.now()}`,
        employeeId: randomEmp.id,
        employeeName: randomEmp.name,
        timestamp: timestampString,
        activeApp: appChoice.app,
        activeWindowDetails: appChoice.details,
        isProductive: appChoice.prod,
        category: appChoice.cat as any
      };

      setSnapshots(prev => [newSnapshot, ...prev]);
      setTotalScansCount(c => c + 1);
      setIsSyncing(false);
    }, 1500);
  };

  // Force Instant Sweep scan (User triggers)
  const handleForceScan = () => {
    handlePeriodicBackgroundSweep();
    setSecondsRemaining(300); // reset countdown to 5 mins
  };

  // Filter logic
  const filteredSnapshots = snapshots.filter(snap => {
    const matchesEmp = selectedEmployeeId === 'all' || snap.employeeId === selectedEmployeeId;
    if (!matchesEmp) return false;

    if (filterType === 'productive') return snap.isProductive;
    if (filterType === 'unproductive') return !snap.isProductive;
    return true;
  });

  // Calculate stats
  const totalScans = filteredSnapshots.length;
  const productiveScans = filteredSnapshots.filter(s => s.isProductive).length;
  const productivityPercentage = totalScans > 0 ? Math.round((productiveScans / totalScans) * 100) : 100;

  // Track break compliance
  const activeBreaks = employees.filter(e => e.status === 'Break');
  
  return (
    <div className="space-y-6" id="system-monitor-workspace">
      
      {/* 5-MINUTE RECURRING MONITORING HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-5 text-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 shadow-lg relative overflow-hidden">
        {/* Subtle decorative elements matching Around29 Orange & Green Theme */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff981a]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#72bf24]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center space-x-4 z-10">
          <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-[#ff981a] shadow-lg">
            <Laptop className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight font-display text-white">Active System & Process Tracker</h2>
              <span className="bg-[#ff981a]/20 text-[#ff981a] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#ff981a]/40">
                Active 5-Min Sweep Interval
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Automatic logging of opened applications, browser tabs, and break intervals</p>
          </div>
        </div>

        {/* 5-MIN TIMER STATUS WRAPPER */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          {/* Real-time countdown widget */}
          <div className="bg-slate-950/80 border border-slate-700/50 rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <div className="space-y-0.5 text-right">
              <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Next 5-Min Sweep</p>
              <p className="text-sm font-mono font-bold text-[#72bf24] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#ff981a] animate-spin" />
                {formatCountdown(secondsRemaining)}
              </p>
            </div>
            <span className="h-7 w-[1px] bg-slate-700" />
            <div className="space-y-0.5">
              <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Total Samples</p>
              <p className="text-sm font-mono font-bold text-white">{totalScansCount} Logs</p>
            </div>
          </div>

          <button
            onClick={handleForceScan}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-[#ff981a] hover:bg-[#e08110] disabled:bg-slate-700 disabled:text-slate-400 text-white text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Scanning...' : 'Scan Now'}</span>
          </button>
        </div>
      </div>

      {/* QUICK BREAK INTEGRITY CHECKS (AUDITED EVERY 5 MINS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="break-compliance-row">
        
        {/* Compliance Widget 1: Active Breaks */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#ff981a] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Break Status Verify</span>
            <p className="text-sm font-extrabold text-slate-800">
              {activeBreaks.length > 0 ? `${activeBreaks.length} Staff On Break` : 'All Staff Active'}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold">Checks activity signatures every 5m</p>
          </div>
        </div>

        {/* Compliance Widget 2: Productivity Score */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-[#72bf24] flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">System Productivity Index</span>
            <p className="text-sm font-extrabold text-[#72bf24]">{productivityPercentage}% Score</p>
            <p className="text-[10px] text-slate-400 font-semibold">Across {totalScans} evaluated process samples</p>
          </div>
        </div>

        {/* Compliance Widget 3: Break Alert Level */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Break Threshold Alerts</span>
            <p className="text-sm font-extrabold text-slate-800">0 Overdue Alerts</p>
            <p className="text-[10px] text-red-500 font-semibold">Exceeding 5-minute idle warnings</p>
          </div>
        </div>

      </div>

      {/* FILTER & FILTER PANELS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="process-log-matrix">
        
        {/* Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 font-sans tracking-tight">Active Process Audit Registry</h3>
            <p className="text-xs text-slate-400">Granular view of active windows and website titles monitored at 5-minute ticks</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Employee Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Employee:</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="bg-white border rounded-lg px-2.5 py-1 text-xs text-slate-700 font-semibold focus:outline-hidden"
              >
                <option value="all">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            {/* Productive / Unproductive Selector */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-all text-[10px] uppercase cursor-pointer ${
                  filterType === 'all' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('productive')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-all text-[10px] uppercase cursor-pointer ${
                  filterType === 'productive' ? 'bg-white text-[#72bf24] shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                Productive Only
              </button>
              <button
                onClick={() => setFilterType('unproductive')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-all text-[10px] uppercase cursor-pointer ${
                  filterType === 'unproductive' ? 'bg-white text-[#ff981a] shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                Unproductive
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Snapshots Grid List */}
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {filteredSnapshots.length > 0 ? (
            filteredSnapshots.map((snap, idx) => (
              <div 
                key={snap.id} 
                className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Employee / Timestamp Meta */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-mono font-bold text-slate-500 text-xs text-center border border-slate-200">
                    {snap.timestamp}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{snap.employeeName}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      ID: {snap.employeeId}
                    </p>
                  </div>
                </div>

                {/* Application & Window details */}
                <div className="flex-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md font-mono">
                      {snap.activeApp}
                    </span>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide px-1.5 py-0.5 bg-slate-50 border rounded-md">
                      {snap.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold mt-1 italic truncate">
                    "{snap.activeWindowDetails}"
                  </p>
                </div>

                {/* Status Evaluation badges with Around29 Colors */}
                <div className="flex items-center gap-2.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    snap.isProductive 
                      ? 'bg-green-50 text-[#72bf24] border border-green-200' 
                      : 'bg-orange-50 text-[#ff981a] border border-orange-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${snap.isProductive ? 'bg-[#72bf24]' : 'bg-[#ff981a]'}`} />
                    {snap.isProductive ? 'Productive App' : 'Non-Work Activity'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-extrabold text-slate-500">No matching system snapshots found</p>
              <p className="text-[10px] text-slate-400">Try changing your filters or trigger a fresh 5-minute scan sweep manually.</p>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="p-3 bg-slate-50 border-t text-[10px] text-slate-400 font-semibold flex items-center justify-between">
          <span>* Automatic system tracking sweeps occur securely every 300 seconds (5 minutes).</span>
          <span className="text-[#ff981a] flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> ISO-27001 Secure Agent
          </span>
        </div>
      </div>

    </div>
  );
}
