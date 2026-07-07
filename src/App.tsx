import { useState, useEffect } from 'react';
import { Employee, Project, TaskSession, BreakLog, TimeClaim } from './types';
import { INITIAL_EMPLOYEES, INITIAL_PROJECTS, INITIAL_SESSIONS, INITIAL_BREAKS, INITIAL_CLAIMS } from './initialData';
import Dashboard from './components/Dashboard';
import TimeTracker from './components/TimeTracker';
import EmployeeRoster from './components/EmployeeRoster';
import WorkHistory from './components/WorkHistory';
import MyBreakroomAndClaims from './components/MyBreakroomAndClaims';
import ClaimsApproval from './components/ClaimsApproval';

// Around29 Custom Dashboard Components
import Logo from './components/Logo';
import SystemMonitor from './components/SystemMonitor';
import EmployeeDashboard from './components/EmployeeDashboard';
import AuthScreen from './components/AuthScreen';
import DailySummaryModal from './components/DailySummaryModal';

import { 
  BarChart3, 
  Clock, 
  Users, 
  FolderKanban, 
  History, 
  Building2, 
  Calendar,
  Sparkles,
  Coffee,
  ShieldCheck,
  UserCheck,
  Laptop,
  LayoutGrid,
  ShieldAlert,
  LogOut,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState<(Employee & { password?: string; isAdmin?: boolean }) | null>(() => {
    const saved = localStorage.getItem('around29_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [dailySummaryOpen, setDailySummaryOpen] = useState(false);

  const [roleMode, setRoleMode] = useState<'admin' | 'employee'>('admin');
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'tracker' | 'employees' | 'projects' | 'history' | 'breaks-claims' | 'approvals' | 'system-monitor' | 'employee-dashboard'
  >('dashboard');

  // Core States (backed by localStorage)
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('timechamp_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('timechamp_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [sessions, setSessions] = useState<TaskSession[]>(() => {
    const saved = localStorage.getItem('timechamp_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [activeSession, setActiveSession] = useState<TaskSession | null>(() => {
    const saved = localStorage.getItem('timechamp_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Login, Breaks, and Time Claims States
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(() => {
    return localStorage.getItem('timechamp_current_employee_id') || 'AR29061';
  });

  const [breaks, setBreaks] = useState<BreakLog[]>(() => {
    const saved = localStorage.getItem('timechamp_breaks');
    return saved ? JSON.parse(saved) : INITIAL_BREAKS;
  });

  const [claims, setClaims] = useState<TimeClaim[]>(() => {
    const saved = localStorage.getItem('timechamp_claims');
    return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
  });

  const [activeBreak, setActiveBreak] = useState<BreakLog | null>(() => {
    const saved = localStorage.getItem('timechamp_active_break');
    return saved ? JSON.parse(saved) : null;
  });

  const [systemTime, setSystemTime] = useState(new Date());

  // Keep system time ticking
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Sync core states to localStorage
  useEffect(() => {
    localStorage.setItem('timechamp_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('timechamp_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('timechamp_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('timechamp_active_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('timechamp_active_session');
    }
  }, [activeSession]);

  // Sync authenticatedUser & handle security constraints
  useEffect(() => {
    if (authenticatedUser) {
      localStorage.setItem('around29_auth_user', JSON.stringify(authenticatedUser));
      setCurrentEmployeeId(authenticatedUser.id);
      
      // If user is NOT Admin, they are strictly forced to 'employee' roleMode and 'employee-dashboard' tab
      if (!authenticatedUser.isAdmin) {
        setRoleMode('employee');
        if (
          activeTab === 'dashboard' || 
          activeTab === 'system-monitor' || 
          activeTab === 'employees' || 
          activeTab === 'projects' || 
          activeTab === 'approvals'
        ) {
          setActiveTab('employee-dashboard');
        }
      }
    } else {
      localStorage.removeItem('around29_auth_user');
      setCurrentEmployeeId(null);
    }
  }, [authenticatedUser, activeTab]);

  useEffect(() => {
    localStorage.setItem('timechamp_breaks', JSON.stringify(breaks));
  }, [breaks]);

  useEffect(() => {
    localStorage.setItem('timechamp_claims', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    if (activeBreak) {
      localStorage.setItem('timechamp_active_break', JSON.stringify(activeBreak));
    } else {
      localStorage.removeItem('timechamp_active_break');
    }
  }, [activeBreak]);

  // Portal Login/Logout handlers
  const handleLogin = (id: string) => {
    setCurrentEmployeeId(id);
  };

  const handleLogout = () => {
    if (activeBreak) {
      handleEndBreak();
    }
    setAuthenticatedUser(null);
    setCurrentEmployeeId(null);
  };

  // Rest & Breaks handlers
  const handleStartBreak = (employeeId: string, type: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    // If currently tracking a task, stop tracking it before starting break
    if (activeSession && activeSession.employeeId === employeeId) {
      handleStopTracking(85);
    }

    const newBreak: BreakLog = {
      id: `break-${Date.now()}`,
      employeeId,
      employeeName: emp.name,
      type,
      startTime: new Date().toISOString(),
      endTime: null,
      durationSeconds: 0
    };

    setActiveBreak(newBreak);
    setBreaks(prev => [newBreak, ...prev]);

    setEmployees(prev => prev.map(e => {
      if (e.id === employeeId) {
        return {
          ...e,
          status: 'Break'
        };
      }
      return e;
    }));
  };

  const handleEndBreak = () => {
    if (!activeBreak) return;

    const endTimeIso = new Date().toISOString();
    const durationSecs = Math.max(1, Math.floor((Date.now() - new Date(activeBreak.startTime).getTime()) / 1000));

    setBreaks(prev => prev.map(b => {
      if (b.id === activeBreak.id) {
        return {
          ...b,
          endTime: endTimeIso,
          durationSeconds: durationSecs
        };
      }
      return b;
    }));

    setEmployees(prev => prev.map(e => {
      if (e.id === activeBreak.employeeId) {
        return {
          ...e,
          status: 'Idle'
        };
      }
      return e;
    }));

    setActiveBreak(null);
  };

  // Submit and approve manual offsite claims
  const handleSubmitClaim = (
    projectId: string, 
    taskName: string, 
    date: string, 
    hours: number, 
    reason: string
  ) => {
    if (!currentEmployeeId) return;
    const emp = employees.find(e => e.id === currentEmployeeId);
    const proj = projects.find(p => p.id === projectId);
    if (!emp || !proj) return;

    const newClaim: TimeClaim = {
      id: `claim-${Date.now()}`,
      employeeId: currentEmployeeId,
      employeeName: emp.name,
      projectId,
      projectName: proj.name,
      taskName,
      date,
      hours,
      reason,
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };

    setClaims(prev => [newClaim, ...prev]);
  };

  const handleApproveClaim = (claimId: string) => {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;

    setClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return { ...c, status: 'Approved' };
      }
      return c;
    }));

    // Create a complete historic task log
    const completedSession: TaskSession = {
      id: `sess-claim-${Date.now()}`,
      employeeId: claim.employeeId,
      employeeName: claim.employeeName,
      projectId: claim.projectId,
      projectName: claim.projectName,
      taskName: claim.taskName,
      startTime: new Date(`${claim.date}T09:00:00`).toISOString(),
      endTime: new Date(`${claim.date}T17:00:00`).toISOString(),
      durationSeconds: claim.hours * 3600,
      description: `[Claims Adjustment] ${claim.reason}`,
      productivityScore: 92,
    };

    setSessions(prev => [completedSession, ...prev]);

    // Update employee tracked hour totals
    setEmployees(prev => prev.map(e => {
      if (e.id === claim.employeeId) {
        return {
          ...e,
          totalHoursTracked: e.totalHoursTracked + claim.hours
        };
      }
      return e;
    }));

    // Add hours to targeted project spent quota
    setProjects(prev => prev.map(p => {
      if (p.id === claim.projectId) {
        return {
          ...p,
          spentHours: p.spentHours + claim.hours
        };
      }
      return p;
    }));
  };

  const handleRejectClaim = (claimId: string, rejectionReason: string) => {
    setClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return {
          ...c,
          status: 'Rejected',
          rejectionReason
        };
      }
      return c;
    }));
  };

  // Core Tracking Actions
  const handleStartTracking = (
    employeeId: string, 
    projectId: string, 
    taskName: string, 
    description: string
  ) => {
    const emp = employees.find(e => e.id === employeeId);
    const proj = projects.find(p => p.id === projectId);
    if (!emp || !proj) return;

    // Create active session
    const newSession: TaskSession = {
      id: `sess-${Date.now()}`,
      employeeId,
      employeeName: emp.name,
      projectId,
      projectName: proj.name,
      taskName,
      startTime: new Date().toISOString(),
      endTime: null,
      durationSeconds: 0,
      description: description.trim() || `Working on ${taskName}`,
      productivityScore: 90, // initial
    };

    // Set active session & update employee status to active
    setActiveSession(newSession);
    
    setEmployees(prev => prev.map(e => {
      if (e.id === employeeId) {
        return {
          ...e,
          status: 'Active',
          activeProjectName: proj.name,
          activeTaskName: taskName,
        };
      }
      return e;
    }));
  };

  const handleStopTracking = (finalProductivityScore: number) => {
    if (!activeSession) return;

    const endTimeIso = new Date().toISOString();
    const durationSecs = Math.max(1, Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000));
    const hoursTracked = durationSecs / 3600;

    // Generate telemetry logs
    const taskLower = activeSession.taskName.toLowerCase();
    const activeLinks: string[] = [];
    const searchEngineQueries: string[] = [];
    
    if (taskLower.includes('prototype') || taskLower.includes('wireframe') || taskLower.includes('design') || taskLower.includes('ui')) {
      activeLinks.push('https://figma.com/file/around29-work-space', 'https://dribbble.com/search/ui');
      searchEngineQueries.push(`${activeSession.taskName} modern UI UX templates`, 'figma auto layout spacing guide');
    } else if (taskLower.includes('db') || taskLower.includes('query') || taskLower.includes('schema') || taskLower.includes('postgres') || taskLower.includes('database')) {
      activeLinks.push('https://postgresql.org/docs', 'https://console.cloud.google.com/sql/instances');
      searchEngineQueries.push(`postgres slow query performance indexing`, `${activeSession.taskName} troubleshooting steps`);
    } else if (taskLower.includes('test') || taskLower.includes('validation') || taskLower.includes('qa')) {
      activeLinks.push('https://jestjs.io/docs', 'https://github.com/around29/tests');
      searchEngineQueries.push(`how to write responsive component integration tests`, `mocha chai test setup`);
    } else {
      activeLinks.push('https://github.com/around29/champ-workspace', 'https://stackoverflow.com');
      searchEngineQueries.push(`how to implement ${activeSession.taskName}`, `react typescript syntax cheatsheet`);
    }

    const completedSession: TaskSession = {
      ...activeSession,
      endTime: endTimeIso,
      durationSeconds: durationSecs,
      productivityScore: finalProductivityScore,
      activeLinks,
      searchEngineQueries,
    };

    // Update sessions
    setSessions(prev => [completedSession, ...prev]);

    // Update employee: Add hours, restore status to Idle
    setEmployees(prev => prev.map(e => {
      if (e.id === activeSession.employeeId) {
        return {
          ...e,
          totalHoursTracked: e.totalHoursTracked + hoursTracked,
          activeProjectName: undefined,
          activeTaskName: undefined,
          status: 'Idle'
        };
      }
      return e;
    }));

    // Update project hours
    setProjects(prev => prev.map(p => {
      if (p.id === activeSession.projectId) {
        return {
          ...p,
          spentHours: p.spentHours + hoursTracked,
        };
      }
      return p;
    }));

    // Reset active tracking state
    setActiveSession(null);
  };

  const handleManualLog = (manualSession: Omit<TaskSession, 'id'>) => {
    const newId = `sess-${Date.now()}`;
    const taskLower = manualSession.taskName.toLowerCase();
    const activeLinks: string[] = [];
    const searchEngineQueries: string[] = [];
    
    if (taskLower.includes('prototype') || taskLower.includes('wireframe') || taskLower.includes('design') || taskLower.includes('ui')) {
      activeLinks.push('https://figma.com/file/around29-work-space', 'https://dribbble.com/search/ui');
      searchEngineQueries.push(`${manualSession.taskName} modern UI UX templates`, 'figma auto layout spacing guide');
    } else if (taskLower.includes('db') || taskLower.includes('query') || taskLower.includes('schema') || taskLower.includes('postgres') || taskLower.includes('database')) {
      activeLinks.push('https://postgresql.org/docs', 'https://console.cloud.google.com/sql/instances');
      searchEngineQueries.push(`postgres slow query performance indexing`, `${manualSession.taskName} troubleshooting steps`);
    } else {
      activeLinks.push('https://github.com/around29/champ-workspace', 'https://stackoverflow.com');
      searchEngineQueries.push(`how to implement ${manualSession.taskName}`, `react typescript syntax cheatsheet`);
    }

    const completedSession: TaskSession = {
      ...manualSession,
      id: newId,
      activeLinks,
      searchEngineQueries
    };

    setSessions(prev => [completedSession, ...prev]);

    // Update employee hours
    const hours = manualSession.durationSeconds / 3600;
    setEmployees(prev => prev.map(e => {
      if (e.id === manualSession.employeeId) {
        return {
          ...e,
          totalHoursTracked: e.totalHoursTracked + hours,
        };
      }
      return e;
    }));

    // Update project hours
    setProjects(prev => prev.map(p => {
      if (p.id === manualSession.projectId) {
        return {
          ...p,
          spentHours: p.spentHours + hours,
        };
      }
      return p;
    }));
  };

  // Employee CRUD operations
  const handleAddEmployee = (newEmp: Omit<Employee, 'id' | 'totalHoursTracked'>) => {
    const employeeWithId: Employee = {
      ...newEmp,
      id: `emp-${Date.now()}`,
      totalHoursTracked: 0,
    };
    setEmployees(prev => [...prev, employeeWithId]);
  };

  const handleUpdateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, ...updates };
      }
      return e;
    }));
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  // Project operations
  const handleAddProject = (newProj: Omit<Project, 'id' | 'spentHours'>) => {
    const projectWithId: Project = {
      ...newProj,
      id: `proj-${Date.now()}`,
      spentHours: 0,
    };
    setProjects(prev => [...prev, projectWithId]);
  };

  const handleAddTaskToProject = (projectId: string, taskName: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: [...p.tasks, taskName],
        };
      }
      return p;
    }));
  };

  // Session Correction (Delete)
  const handleDeleteSession = (sessionId: string) => {
    const sessionToDel = sessions.find(s => s.id === sessionId);
    if (!sessionToDel) return;

    const hours = sessionToDel.durationSeconds / 3600;

    // Deduct tracked hours from employee
    setEmployees(prev => prev.map(e => {
      if (e.id === sessionToDel.employeeId) {
        return {
          ...e,
          totalHoursTracked: Math.max(0, e.totalHoursTracked - hours),
        };
      }
      return e;
    }));

    // Deduct from project spent hours
    setProjects(prev => prev.map(p => {
      if (p.id === sessionToDel.projectId) {
        return {
          ...p,
          spentHours: Math.max(0, p.spentHours - hours),
        };
      }
      return p;
    }));

    // Remove from logs list
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  // Render correct panel
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            employees={employees} 
            projects={projects} 
            sessions={sessions} 
            claims={claims}
            breaks={breaks}
            currentEmployeeId={currentEmployeeId}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onAddClaim={handleSubmitClaim}
          />
        );
      case 'system-monitor':
        return (
          <SystemMonitor 
            employees={employees}
            sessions={sessions}
            breaks={breaks}
          />
        );
      case 'employee-dashboard': {
        const defaultEmp = employees.find(e => e.id === currentEmployeeId) || employees[0];
        return (
          <EmployeeDashboard 
            currentEmployee={defaultEmp}
            sessions={sessions}
            breaks={breaks}
            claims={claims}
            onSubmitClaim={handleSubmitClaim}
            projects={projects}
          />
        );
      }
      case 'tracker':
        return (
          <TimeTracker 
            employees={employees} 
            projects={projects} 
            activeSession={activeSession}
            onStartTracking={handleStartTracking}
            onStopTracking={handleStopTracking}
            onManualLog={handleManualLog}
          />
        );
      case 'employees':
        return (
          <EmployeeRoster 
            employees={employees} 
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        );
      case 'history':
        return (
          <WorkHistory 
            sessions={sessions} 
            employees={employees} 
            projects={projects} 
            onDeleteSession={handleDeleteSession}
          />
        );
      case 'breaks-claims':
        return (
          <MyBreakroomAndClaims 
            employees={employees}
            projects={projects}
            currentEmployeeId={currentEmployeeId}
            onLogin={handleLogin}
            onLogout={handleLogout}
            breaks={breaks}
            onStartBreak={handleStartBreak}
            onEndBreak={handleEndBreak}
            activeBreak={activeBreak}
            claims={claims}
            onSubmitClaim={handleSubmitClaim}
          />
        );
      case 'approvals':
        return (
          <ClaimsApproval 
            claims={claims}
            employees={employees}
            projects={projects}
            onApproveClaim={handleApproveClaim}
            onRejectClaim={handleRejectClaim}
          />
        );
    }
  };

  if (!authenticatedUser) {
    return (
      <AuthScreen 
        employees={employees}
        onRegisterEmployee={handleAddEmployee}
        onLoginSuccess={(user) => {
          setAuthenticatedUser(user);
          // Auto-route on successful login
          if (user.isAdmin) {
            setRoleMode('admin');
            setActiveTab('dashboard');
          } else {
            setRoleMode('employee');
            setActiveTab('employee-dashboard');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans antialiased" id="timechamp-applet-shell">
      {/* Desktop Sidebar / Mobile Nav Header */}
      <aside className="w-full md:w-64 bg-[#1d232a] text-slate-100 flex flex-col border-r border-slate-800 md:h-screen sticky top-0 z-40 dark" id="sidebar-container">
        
        {/* Branding header featuring Around29 Chat Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Logo showText={true} className="h-9" />
          {activeSession && (
            <span className="w-2.5 h-2.5 rounded-full bg-[#72bf24] animate-ping" title="Tracking hour session" />
          )}
        </div>

        {/* DOUBLE DASHBOARDS ROLE SELECTOR WIDGET */}
        {authenticatedUser?.isAdmin && (
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/30">
            <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1.5 px-1">Select Dashboard</p>
            <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/45">
              <button
                onClick={() => {
                  setRoleMode('admin');
                  setActiveTab('dashboard');
                }}
                className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  roleMode === 'admin' 
                    ? 'bg-[#ff981a] text-white shadow-md shadow-orange-500/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
                id="role-select-admin"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
              <button
                onClick={() => {
                  setRoleMode('employee');
                  setActiveTab('employee-dashboard');
                }}
                className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  roleMode === 'employee' 
                    ? 'bg-[#72bf24] text-white shadow-md shadow-green-500/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
                id="role-select-employee"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Employee</span>
              </button>
            </div>
          </div>
        )}

        {/* Sidebar Nav links based on Role Dashboards */}
        <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto">
          {roleMode === 'admin' ? (
            <>
              <div className="pb-2 px-3">
                <span className="text-[10px] text-[#ff981a] uppercase font-black tracking-wider">Admin Dashboard</span>
              </div>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-xs transition-all cursor-pointer rounded-lg ${
                  activeTab === 'dashboard'
                    ? 'bg-[#ff981a]/10 border-l-4 border-[#ff981a] text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
                id="nav-dashboard"
              >
                <BarChart3 className="w-4 h-4 text-[#ff981a]" />
                <span>Admin Overview</span>
              </button>

              {/* 5-MINUTE SYSTEM APPLICATION ACTIVITY TRACKER */}
              <button
                onClick={() => setActiveTab('system-monitor')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs transition-all cursor-pointer rounded-lg ${
                  activeTab === 'system-monitor'
                    ? 'bg-[#ff981a]/10 border-l-4 border-[#ff981a] text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
                id="nav-system-monitor"
              >
                <div className="flex items-center space-x-3">
                  <Laptop className="w-4 h-4 text-[#ff981a]" />
                  <span>5-Min System Monitor</span>
                </div>
                <span className="bg-[#72bf24]/20 text-[#72bf24] text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                  LIVE
                </span>
              </button>

              <button
                onClick={() => setActiveTab('employees')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-xs transition-all cursor-pointer rounded-lg ${
                  activeTab === 'employees'
                    ? 'bg-[#ff981a]/10 border-l-4 border-[#ff981a] text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
                id="nav-employees"
              >
                <Users className="w-4 h-4" />
                <span>Employee Roster</span>
              </button>

              <button
                onClick={() => setActiveTab('approvals')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs transition-all cursor-pointer rounded-lg ${
                  activeTab === 'approvals'
                    ? 'bg-[#ff981a]/10 border-l-4 border-[#ff981a] text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
                id="nav-approvals"
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Hour Approvals</span>
                </div>
                {claims.filter(c => c.status === 'Pending').length > 0 && (
                  <span className="bg-[#ff981a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    {claims.filter(c => c.status === 'Pending').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-xs transition-all cursor-pointer rounded-lg ${
                  activeTab === 'history'
                    ? 'bg-[#ff981a]/10 border-l-4 border-[#ff981a] text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
                id="nav-history"
              >
                <History className="w-4 h-4" />
                <span>Session Logs</span>
              </button>
            </>
          ) : (
            <>
              <div className="pb-2 px-3">
                <span className="text-[10px] text-[#72bf24] uppercase font-black tracking-wider">Employee Space</span>
              </div>

              <button
                onClick={() => setActiveTab('employee-dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-xs transition-all cursor-pointer rounded-lg ${
                  activeTab === 'employee-dashboard'
                    ? 'bg-[#72bf24]/10 border-l-4 border-[#72bf24] text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
                id="nav-employee-dashboard"
              >
                <LayoutGrid className="w-4 h-4 text-[#72bf24]" />
                <span>Portal Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('tracker')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs transition-all cursor-pointer rounded-lg ${
                  activeTab === 'tracker'
                    ? 'bg-[#72bf24]/10 border-l-4 border-[#72bf24] text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
                id="nav-tracker"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-[#72bf24]" />
                  <span>Time Tracker</span>
                </div>
                {activeSession && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md animate-pulse">
                    LIVE
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('breaks-claims')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs transition-all cursor-pointer rounded-lg ${
                  activeTab === 'breaks-claims'
                    ? 'bg-[#72bf24]/10 border-l-4 border-[#72bf24] text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
                id="nav-breaks-claims"
              >
                <div className="flex items-center space-x-3">
                  <Coffee className="w-4 h-4" />
                  <span>Breaks & Claims</span>
                </div>
                {currentEmployeeId && (
                  <span className="bg-[#72bf24] text-[9px] font-extrabold text-white px-1.5 py-0.5 rounded-md">
                    PORTAL
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-xs transition-all cursor-pointer rounded-lg ${
                  activeTab === 'history'
                    ? 'bg-[#72bf24]/10 border-l-4 border-[#72bf24] text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
                id="nav-history"
              >
                <History className="w-4 h-4" />
                <span>My Session Logs</span>
              </button>
            </>
          )}
        </nav>

        {/* Workspace info & system clock */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/20 text-xs text-slate-500 font-mono space-y-2" id="system-readout">
          <p className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Around 29
          </p>
          <p className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{systemTime.toLocaleDateString()}</span>
          </p>
          <p className="flex items-center gap-1.5 font-bold text-slate-400">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{systemTime.toLocaleTimeString()}</span>
          </p>
        </div>
      </aside>

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto" id="workspace-container">
        {/* Top bar header */}
        <header className="h-20 bg-white border-b border-slate-200 py-4 px-6 md:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-30 animate-none shrink-0" id="header-bar">
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight font-display">
              {roleMode === 'admin' ? 'Around29 Admin Command Center' : 'Around29 Employee Workspace Portal'}
            </h1>
            <p className="text-slate-400 text-[11px] font-medium">
              {roleMode === 'admin' 
                ? 'Monitors active windows, processes, and break logs checked every 5 minutes' 
                : 'Manage timesheets, active breaks, and view local sync status'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Daily Summary Report from image 1 */}
            <button
              onClick={() => setDailySummaryOpen(true)}
              className="flex items-center gap-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 px-3 py-1.5 rounded-xl text-indigo-700 font-bold transition-all cursor-pointer"
              title="Open the Daily Summary Report from July 6"
              id="header-summary-report-btn"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Jul 6 Summary Report</span>
            </button>

            {currentEmployeeId && (
              <button
                onClick={() => {
                  setRoleMode('employee');
                  setActiveTab('employee-dashboard');
                }}
                className="flex items-center gap-2 text-xs bg-orange-50/50 hover:bg-orange-50 border border-orange-100 pl-2 pr-3 py-1.5 rounded-xl transition-all cursor-pointer"
                title="View your Portal Workspace"
                id="header-profile-btn"
              >
                <img 
                  src={employees.find(e => e.id === currentEmployeeId)?.avatar} 
                  alt="" 
                  className="w-6 h-6 rounded-lg object-cover" 
                  referrerPolicy="no-referrer"
                />
                <span className="font-bold text-[#ff981a]">Portal: {employees.find(e => e.id === currentEmployeeId)?.name}</span>
              </button>
            )}

            {activeSession ? (
              <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-3.5 py-1.5 text-xs flex items-center gap-2 font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Around29 is tracking live</span>
              </div>
            ) : (
              <div className="text-xs font-semibold text-[#72bf24] bg-green-50/50 border border-green-100 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#72bf24] animate-pulse" />
                <span>Around29 Sync Active</span>
              </div>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 font-bold transition-all cursor-pointer"
              title="Log out of Around29 Workspace"
              id="header-logout-btn"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* View container with smooth transitions */}
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto" id="content-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Daily summary report from July 6 */}
      {dailySummaryOpen && (
        <DailySummaryModal isOpen={dailySummaryOpen} onClose={() => setDailySummaryOpen(false)} />
      )}
    </div>
  );
}
