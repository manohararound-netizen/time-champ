import { useState } from 'react';
import { TaskSession, Employee, Project } from '../types';
import { Search, Calendar, Filter, Download, Trash2, Tag, ArrowRight, TrendingUp, Globe, ExternalLink, Compass, Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WorkHistoryProps {
  sessions: TaskSession[];
  employees: Employee[];
  projects: Project[];
  onDeleteSession: (sessionId: string) => void;
  currentEmployeeId?: string | null;
  isAdmin?: boolean;
}

export default function WorkHistory({
  sessions,
  employees,
  projects,
  onDeleteSession,
  currentEmployeeId = null,
  isAdmin = true,
}: WorkHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmpId, setFilterEmpId] = useState(() => isAdmin ? 'all' : (currentEmployeeId || ''));

  // Format seconds to readable hours & minutes (e.g., 2h 15m)
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filtered sessions list
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEmp = filterEmpId === 'all' || session.employeeId === filterEmpId;

    return matchesSearch && matchesEmp;
  });

  // Productivity status colors
  const getProdColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    if (score >= 75) return 'text-amber-700 bg-amber-50 border-amber-100';
    return 'text-red-700 bg-red-50 border-red-100';
  };

  // Export to CSV simulation
  const handleExportCSV = () => {
    if (filteredSessions.length === 0) {
      alert('No sessions to export.');
      return;
    }

    const headers = 'Employee,Task,Date,Start,End,Duration(hrs),ProductivityScore,Description\n';
    const rows = filteredSessions.map(s => {
      const durationHours = (s.durationSeconds / 3600).toFixed(2);
      const dateStr = new Date(s.startTime).toLocaleDateString();
      const startStr = new Date(s.startTime).toLocaleTimeString();
      const endStr = s.endTime ? new Date(s.endTime).toLocaleTimeString() : 'Active';
      
      return `"${s.employeeName}","${s.taskName}","${dateStr}","${startStr}","${endStr}",${durationHours},${s.productivityScore},"${s.description.replace(/"/g, '""')}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `timechamp_sessions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // History of employees worked on computed from sessions
  const employeesWorkedOn = Array.from(new Set(sessions.map(s => s.employeeId)))
    .map(empId => {
      const emp = employees.find(e => e.id === empId);
      const empSessions = sessions.filter(s => s.employeeId === empId);
      const totalDurationSeconds = empSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
      const totalHours = (totalDurationSeconds / 3600).toFixed(1);
      const lastSession = empSessions.reduce((latest, s) => {
        if (!latest) return s;
        return new Date(s.startTime) > new Date(latest.startTime) ? s : latest;
      }, null as TaskSession | null);

      return {
        id: empId,
        name: emp?.name || empSessions[0]?.employeeName || 'Unknown Employee',
        role: emp?.role || 'Staff Member',
        avatar: emp?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120&h=120',
        totalHours,
        sessionCount: empSessions.length,
        lastActiveDate: lastSession ? new Date(lastSession.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
        lastTask: lastSession ? lastSession.taskName : 'N/A'
      };
    });

  return (
    <div className="space-y-6">
      {/* Contributors & Employee Work History Summary - ADMIN ONLY */}
      {isAdmin && (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs" id="employee-work-history-panel">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              Contributors & Employee Work History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Summary of all team members who have tracked work sessions</p>
          </div>

          {employeesWorkedOn.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {employeesWorkedOn.map(emp => (
                <div 
                  key={emp.id} 
                  className="bg-slate-50/50 hover:bg-slate-100 border border-slate-150 p-4 rounded-xl transition-all flex items-center gap-3.5"
                  id={`work-history-emp-${emp.id}`}
                >
                  <img 
                    src={emp.avatar} 
                    alt={emp.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-slate-800 truncate">{emp.name}</h4>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-sm shrink-0">
                        {emp.totalHours} hrs
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{emp.role}</p>
                    
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-500 font-semibold font-mono">
                      <span className="truncate max-w-[120px]" title={`Last Task: ${emp.lastTask}`}>
                        Last: {emp.lastTask}
                      </span>
                      <span className="text-slate-400 shrink-0">
                        {emp.lastActiveDate}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400 font-semibold">
              No work sessions recorded yet.
            </div>
          )}
        </div>
      )}

      {/* Filtering and Search Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4" id="work-history-filter-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-display">Work Hours Session Log</h3>
            <p className="text-xs text-slate-400">
              {isAdmin 
                ? 'Audit, filter, and inspect tracked timesheets and productivity indices' 
                : 'Inspect your personal tracked timesheets and performance history'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleExportCSV}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-xs text-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
              id="export-csv-btn"
            >
              <Download className="w-4 h-4" /> Export Timesheet (.CSV)
            </button>
          )}
        </div>

        {/* Input selectors */}
        <div className={`grid gap-3 pt-2 ${isAdmin ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search task details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              id="search-history-input"
            />
          </div>

          {/* Employee Filter - ADMIN ONLY */}
          {isAdmin ? (
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                value={filterEmpId}
                onChange={(e) => setFilterEmpId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs font-semibold text-slate-600 focus:outline-hidden focus:border-indigo-500"
                id="filter-employee-select"
              >
                <option value="all">Filter by Employee: All</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span>Showing timesheet records for active session user: <strong>{employees.find(e => e.id === currentEmployeeId)?.name || 'Standard Employee'}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Sessions Feed List */}
      <div className="space-y-3" id="sessions-history-list">
        <AnimatePresence mode="popLayout">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session, index) => {
              // Get employee details if available for avatar
              const emp = employees.find(e => e.id === session.employeeId);
              const avatar = emp?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120&h=120';
              const role = emp?.role || 'Staff Member';

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                  className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 transition-colors"
                  id={`session-log-card-${session.id}`}
                >
                  {/* Left Column: Employee & Task */}
                  <div className="flex items-start space-x-4">
                    <img
                      src={avatar}
                      alt={session.employeeName}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm">{session.employeeName}</span>
                        <span className="text-[10px] text-slate-400 font-semibold font-mono bg-slate-50/50 px-1.5 py-0.5 rounded border border-slate-100">{role}</span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-slate-700">
                        {session.taskName}
                      </h4>

                      <p className="text-xs text-slate-600 font-medium">
                        {session.description}
                      </p>

                      {/* Telemetry Search and Links logs */}
                      {((session.searchEngineQueries && session.searchEngineQueries.length > 0) || (session.activeLinks && session.activeLinks.length > 0)) && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                          {session.searchEngineQueries && session.searchEngineQueries.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-extrabold text-amber-600 flex items-center gap-1 uppercase tracking-wider">
                                <Compass className="w-3 h-3 text-amber-500 shrink-0" />
                                Search Engine Queries
                              </span>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {session.searchEngineQueries.map((query, qidx) => (
                                  <span key={qidx} className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-100">
                                    "{query}"
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {session.activeLinks && session.activeLinks.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-extrabold text-sky-600 flex items-center gap-1 uppercase tracking-wider">
                                <Globe className="w-3 h-3 text-sky-500 shrink-0" />
                                Tracked Browser Links
                              </span>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {session.activeLinks.map((link, lidx) => (
                                  <a
                                    key={lidx}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-mono text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded-md border border-sky-100 flex items-center gap-1 transition-colors"
                                  >
                                    <span className="truncate max-w-[220px]">{link.replace('https://', '')}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Timestamps & Duration */}
                  <div className="flex flex-row md:flex-col justify-between items-center md:items-start border-t border-b border-slate-50 py-2 md:py-0 md:border-0 md:pl-4 font-mono">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(session.startTime)}</span>
                    </div>

                    <div className="text-xs font-medium text-slate-500 mt-0.5">
                      <span>{formatTime(session.startTime)}</span>
                      {session.endTime ? (
                        <span> &rsaquo; {formatTime(session.endTime)}</span>
                      ) : (
                        <span className="text-indigo-600 font-bold animate-pulse"> (Active)</span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Duration, Score and Action */}
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    {/* Time tracked summary box */}
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">Duration</span>
                      <p className="text-sm font-bold text-slate-800 font-mono">
                        {formatDuration(session.durationSeconds)}
                      </p>
                    </div>

                    {/* Productivity Score badge */}
                    <div className={`text-center px-3 py-1.5 rounded-xl border ${getProdColor(session.productivityScore)} min-w-[70px]`}>
                      <span className="text-[9px] uppercase font-bold block scale-90 tracking-wider">Prod. Score</span>
                      <span className="text-sm font-black font-display flex items-center justify-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> {session.productivityScore}%
                      </span>
                    </div>

                    {/* Delete action button - ADMIN ONLY */}
                    {isAdmin && (
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-2 cursor-pointer"
                        title="Remove Hour Log"
                        id={`delete-sess-btn-${session.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center"
              id="empty-logs-card"
            >
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No logs match your search parameters</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try clearing search strings, switching employee drop-downs back to 'All', or starting a brand new live tracking session.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
