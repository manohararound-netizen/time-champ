import React, { useState, useEffect, useRef } from 'react';
import { Employee, Project, TaskSession } from '../types';
import { 
  Play, 
  Pause, 
  Square, 
  FileEdit, 
  UserCheck, 
  Folder, 
  Calendar, 
  Activity, 
  Cpu, 
  Clock, 
  ChevronDown, 
  Download, 
  Info,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TimeTrackerProps {
  employees: Employee[];
  projects: Project[];
  activeSession: TaskSession | null;
  onStartTracking: (employeeId: string, projectId: string, taskName: string, description: string) => void;
  onStopTracking: (productivityScore: number) => void;
  onManualLog: (session: Omit<TaskSession, 'id'>) => void;
}

export default function TimeTracker({
  employees,
  projects,
  activeSession,
  onStartTracking,
  onStopTracking,
  onManualLog,
}: TimeTrackerProps) {
  // Image 2 Subtabs: Overview, Attendance, Time Claim
  const [trackerSubTab, setTrackerSubTab] = useState<'overview' | 'attendance' | 'time-claim'>('attendance');
  const [selectedDate, setSelectedDate] = useState('2026-07-07');
  const [selectedTimezone, setSelectedTimezone] = useState('IST');

  // Real-time Timer states (for the active stopwatch in Overview)
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [selectedProjId, setSelectedProjId] = useState(projects[0]?.id || '');
  const [selectedTask, setSelectedTask] = useState('');
  const [description, setDescription] = useState('');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Manual Claim states
  const [manualProjId, setManualProjId] = useState(projects[0]?.id || '');
  const [manualTask, setManualTask] = useState('');
  const [manualHours, setManualHours] = useState('8.0');
  const [manualReason, setManualReason] = useState('');
  const [manualSuccess, setManualSuccess] = useState(false);
  const [claimStartTime, setClaimStartTime] = useState('09:00');
  const [claimEndTime, setClaimEndTime] = useState('17:00');

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
      setManualHours(calculatedHours.toString());
    }
  }, [claimStartTime, claimEndTime]);

  // Simulated Telemetry (window tracking)
  const [liveActivity, setLiveActivity] = useState({
    activity: 'Working on code sprint',
    keystrokes: 42,
    clicks: 12,
    window: 'VS Code - index.tsx',
    score: 95,
  });

  // Sync tasks
  useEffect(() => {
    if (!selectedTask) {
      setSelectedTask('Software Engineering');
    }
  }, [selectedTask]);

  // Stopwatch effect
  useEffect(() => {
    if (activeSession) {
      const startTime = new Date(activeSession.startTime).getTime();
      const tick = () => {
        setSecondsElapsed(Math.floor((Date.now() - startTime) / 1000));
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSecondsElapsed(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession]);

  // Telemetry simulation
  useEffect(() => {
    if (!activeSession) return;
    const items = [
      { act: 'Compiling project builds', win: 'Terminal - npm run build', score: 100 },
      { act: 'Fixing navigation components', win: 'VS Code - sidebar.tsx', score: 94 },
      { act: 'Analyzing core performance', win: 'Chrome DevTools - Profiler', score: 88 },
      { act: 'Reviewing API specifications', win: 'app.connect29.com', score: 95 }
    ];
    const interval = setInterval(() => {
      const pick = items[Math.floor(Math.random() * items.length)];
      setLiveActivity({
        activity: pick.act,
        keystrokes: Math.floor(Math.random() * 50) + 20,
        clicks: Math.floor(Math.random() * 10) + 3,
        window: pick.win,
        score: pick.score
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatSecs = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !selectedTask) return;
    const projId = selectedProjId || projects[0]?.id || 'default';
    onStartTracking(selectedEmpId, projId, selectedTask, description || 'Dynamic tracked session');
  };

  const handleStop = () => {
    onStopTracking(liveActivity.score);
    setDescription('');
  };

  const handleManualClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === manualProjId) || { id: 'default', name: 'General' };
    onManualLog({
      employeeId: selectedEmpId || 'AR29061',
      employeeName: employees.find(emp => emp.id === (selectedEmpId || 'AR29061'))?.name || 'Manohar Donakonda',
      projectId: proj.id,
      projectName: proj.name,
      taskName: manualTask || 'Offline Work',
      startTime: new Date(`${selectedDate}T09:00:00`).toISOString(),
      endTime: new Date(`${selectedDate}T11:00:00`).toISOString(),
      durationSeconds: parseFloat(manualHours) * 3600,
      description: manualReason || 'Offline timesheet claim',
      productivityScore: 92,
    });
    setManualSuccess(true);
    setManualReason('');
    setTimeout(() => setManualSuccess(false), 4000);
  };

  return (
    <div className="space-y-6" id="attendance-tracker-viewport">
      
      {/* SECOND IMAGE - SUBTABS NAVIGATION & TIME PICKER PANEL */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        
        {/* Tab Selector matching Image 2 Layout */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50" id="timetracker-subtab-container">
          <button
            onClick={() => setTrackerSubTab('overview')}
            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              trackerSubTab === 'overview'
                ? 'bg-white text-slate-800 shadow-xs border border-slate-200/30 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#ff981a]" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setTrackerSubTab('attendance')}
            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              trackerSubTab === 'attendance'
                ? 'bg-[#72bf24] text-white shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Attendance</span>
          </button>

          <button
            onClick={() => setTrackerSubTab('time-claim')}
            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              trackerSubTab === 'time-claim'
                ? 'bg-white text-slate-800 shadow-xs border border-slate-200/30 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5 text-indigo-500" />
            <span>Time Claim</span>
          </button>
        </div>

        {/* Date, Timezone & Download Agent Block matching Image 2 Header */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Date Selector */}
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent outline-hidden cursor-pointer"
            />
          </div>

          {/* Timezone Selector dropdown */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50 text-xs font-bold text-slate-700 cursor-pointer">
            <span>{selectedTimezone}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Download Agent Button */}
          <button 
            onClick={() => alert('Downloading latest Around29 client tracker setup for Windows/Mac...')}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#ff981a]" />
            <span>Download Agent</span>
          </button>
        </div>

      </div>

      {/* RENDER ACTIVE TAB */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: ATTENDANCE (IMAGE 2 LAYOUT) */}
        {trackerSubTab === 'attendance' && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* FOUR CORE ATTENDANCE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Working Hours Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total working hours</p>
                <p className="text-3xl font-black text-[#00a3a4] font-mono mt-1.5">02:09</p>
              </div>

              {/* Total Hours Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total hours</p>
                <p className="text-3xl font-black text-[#4ea1ff] font-mono mt-1.5">02:09</p>
              </div>

              {/* Idle Hours Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Idle hours</p>
                <p className="text-3xl font-black text-[#ffb800] font-mono mt-1.5">00:00</p>
              </div>

              {/* Away Hours Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Away hours</p>
                <p className="text-3xl font-black text-[#ff6a6a] font-mono mt-1.5">00:00</p>
              </div>

            </div>

            {/* HORIZONTAL TIMELINE PROGRESS SEGMENT GRAPH */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Daily Activity Timeline Map</h4>
                <span className="text-[10px] font-bold text-slate-400">Date: {selectedDate}</span>
              </div>

              <div className="space-y-3 pt-2">
                {/* Visual Segments Bar */}
                <div className="w-full bg-slate-100 h-11 rounded-xl border border-slate-200 overflow-hidden flex shadow-xs">
                  {/* Offline segment: 17:30 to 19:16 (53% of total viewport hours) */}
                  <div className="h-full bg-slate-200/60 relative group cursor-help transition-all hover:bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500" style={{ width: '45%' }}>
                    <span>Offline (01:46)</span>
                  </div>
                  {/* Working active segment: 19:16 to 21:26 (47% of total hours) */}
                  <div className="h-full bg-[#72bf24] relative group cursor-help transition-all hover:opacity-90 flex items-center justify-center text-[10px] font-black text-white" style={{ width: '55%' }}>
                    <span>Working (02:09)</span>
                  </div>
                </div>

                {/* Timeline hour labels beneath the bar */}
                <div className="flex justify-between text-[11px] text-slate-400 font-mono font-bold px-1.5">
                  <span>19:16</span>
                  <span>20:16</span>
                  <span>21:16</span>
                  <span>22:16</span>
                </div>
              </div>
            </div>

            {/* CHRONOLOGICAL ATTENDANCE GRID TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Audit logs & status classifications</h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-100">
                      <th className="p-4">Start time</th>
                      <th className="p-4">End time</th>
                      <th className="p-4">Spent Time</th>
                      <th className="p-4">User Activity Status</th>
                      <th className="p-4">Working Status</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    
                    {/* Row 1 - Offline */}
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold">17:30</td>
                      <td className="p-4 font-mono font-bold">19:16</td>
                      <td className="p-4 font-mono text-[#ff6a6a]">01:46</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-slate-200">
                          Offline
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-bold">Non-Working</td>
                      <td className="p-4 text-slate-400 italic">No device sync logged</td>
                      <td className="p-4 font-bold text-[#00a3a4]">Original</td>
                    </tr>

                    {/* Row 2 - Working */}
                    <tr className="bg-green-50/20 hover:bg-green-50/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800">19:16</td>
                      <td className="p-4 font-mono font-bold text-slate-800">21:26</td>
                      <td className="p-4 font-mono text-[#72bf24] font-black">02:09</td>
                      <td className="p-4">
                        <span className="bg-green-50 text-[#72bf24] text-[10px] px-2.5 py-0.5 rounded-full font-black border border-green-100">
                          Working
                        </span>
                      </td>
                      <td className="p-4 text-[#72bf24] font-extrabold">Working</td>
                      <td className="p-4 text-slate-400">—</td>
                      <td className="p-4 font-bold text-[#00a3a4]">Original</td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: OVERVIEW (REALTIME STOPWATCH & ACTIVE PROCESS WINDOWS) */}
        {trackerSubTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Live active monitor stopwatch */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-800">Real-time Application Tracker</h3>
                <p className="text-xs text-slate-400">Trigger standard background tracking using your local client simulation.</p>
              </div>

              {!activeSession ? (
                <form onSubmit={handleStart} className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400">Task Activity / Category</label>
                      <select
                        value={selectedTask}
                        onChange={(e) => setSelectedTask(e.target.value)}
                        className="w-full text-xs border rounded-xl p-3 bg-white focus:ring-1 focus:ring-[#ff981a] outline-hidden mt-1 font-semibold"
                      >
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="System Administration">System Administration</option>
                        <option value="Database Optimization">Database Optimization</option>
                        <option value="Technical Consulting">Technical Consulting</option>
                        <option value="Customer Support">Customer Support</option>
                        <option value="Team Standup / Sync">Team Standup / Sync</option>
                        <option value="Research & Planning">Research & Planning</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Work notes</label>
                    <input 
                      type="text"
                      placeholder="e.g. Debugging client dashboard layout issues..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full text-xs border rounded-xl p-3 outline-hidden focus:ring-1 focus:ring-[#ff981a]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#72bf24] hover:bg-[#5fa61d] text-white text-xs font-black py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Launch Around29 Time Audit</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-6 mt-6">
                  <div className="bg-slate-50 border rounded-xl p-6 text-center space-y-4">
                    <span className="inline-flex bg-red-100 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full animate-pulse">
                      Live audit logging
                    </span>
                    <h4 className="text-xl font-bold text-slate-800">{activeSession.taskName}</h4>
                    <p className="text-xs text-[#72bf24] font-black">Active Work Session</p>
                    
                    <div className="text-4xl font-extrabold text-slate-800 font-mono">
                      {formatSecs(secondsElapsed)}
                    </div>

                    <button
                      type="button"
                      onClick={handleStop}
                      className="mx-auto bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop tracking</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Live Auditing logs side widget */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#ff981a]">
                  <Cpu className="w-4 h-4" />
                  <h4 className="text-xs font-black uppercase tracking-wider">Device daemon telemetry</h4>
                </div>
                <p className="text-xs text-slate-400">Real-time logs captured from window managers and activity events.</p>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 text-slate-200 font-mono text-[11px] space-y-3.5 my-4">
                
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">DAEMON_SYNC:</span>
                  <span className="text-[#72bf24] font-bold">ONLINE (5m)</span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-slate-400">ACTIVE_WINDOW:</p>
                  <p className="font-extrabold text-[#ff981a]">{activeSession ? liveActivity.window : 'Idle (No Active Focus)'}</p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-slate-400">PROCESS_AUDIT_LOG:</p>
                  <p className="text-[#72bf24]">{activeSession ? liveActivity.activity : 'Awaiting tracking initialization...'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  <div>
                    <p>KEYSTROKES:</p>
                    <p className="font-extrabold text-slate-200">{activeSession ? liveActivity.keystrokes : 0} /min</p>
                  </div>
                  <div>
                    <p>CLICKS:</p>
                    <p className="font-extrabold text-slate-200">{activeSession ? liveActivity.clicks : 0} /min</p>
                  </div>
                </div>

              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border">
                <Info className="w-4 h-4 text-[#ff981a] shrink-0" />
                <p>Every 5 minutes, these metrics are compiled into a secure post-snapshot sent to the ledger.</p>
              </div>

            </div>

          </motion.div>
        )}

        {/* TAB 3: TIME CLAIM */}
        {trackerSubTab === 'time-claim' && (
          <motion.div
            key="time-claim"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl mx-auto"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800">Submit Hour Claim</h3>
              <p className="text-xs text-slate-400">Claim hours worked offline or on legacy systems without the active desktop daemon client.</p>
            </div>

            <form onSubmit={handleManualClaimSubmit} className="space-y-4 mt-6">
              
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Activity / Task Category</label>
                <select
                  value={manualTask}
                  onChange={(e) => setManualTask(e.target.value)}
                  className="w-full text-xs border rounded-xl p-3 bg-white focus:ring-1 focus:ring-indigo-500 mt-1 outline-hidden font-semibold"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="System Administration">System Administration</option>
                  <option value="Database Optimization">Database Optimization</option>
                  <option value="Technical Consulting">Technical Consulting</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Team Standup / Sync">Team Standup / Sync</option>
                  <option value="Research & Planning">Research & Planning</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Date</label>
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full text-xs border rounded-xl p-3 mt-1 outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Hours claimed</label>
                  <input 
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="24"
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value)}
                    className="w-full text-xs border rounded-xl p-3 mt-1 outline-hidden font-bold text-slate-800 bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Typed Time Section */}
              <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dynamic Hour Calculator</span>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">
                    {manualHours} Hours
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400">Typed Start Time</label>
                    <input 
                      type="time"
                      value={claimStartTime}
                      onChange={(e) => setClaimStartTime(e.target.value)}
                      className="w-full text-xs border rounded-lg p-2 mt-1 bg-white focus:ring-1 focus:ring-indigo-500 outline-hidden font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400">Typed End Time</label>
                    <input 
                      type="time"
                      value={claimEndTime}
                      onChange={(e) => setClaimEndTime(e.target.value)}
                      className="w-full text-xs border rounded-lg p-2 mt-1 bg-white focus:ring-1 focus:ring-indigo-500 outline-hidden font-semibold"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Change these typed times to dynamically update the calculated claimed hours above.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Claim justification reason</label>
                <textarea
                  rows={3}
                  placeholder="Explain why these hours were not captured dynamically by the Around29 background daemon..."
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="w-full text-xs border rounded-xl p-3 mt-1 outline-hidden focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              {manualSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-bold">
                  ✓ Hour claim logged successfully. Added to the administrator approval ledger queue.
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#ff981a] hover:bg-[#e08110] text-white text-xs font-black py-3 rounded-xl transition-all shadow-xs cursor-pointer text-center"
              >
                Submit Timesheet Claim
              </button>

            </form>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
