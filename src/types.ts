export type EmployeeStatus = 'Active' | 'Idle' | 'Break' | 'Meeting';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  hourlyRate: number;
  productivityScore: number; // 0-100
  status: EmployeeStatus;
  activeProjectName?: string;
  activeTaskName?: string;
  totalHoursTracked: number;
  password?: string;
  isAdmin?: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  budgetHours: number;
  spentHours: number;
  color: string; // Tailwind color class string (e.g., 'emerald', 'sky')
  tasks: string[];
}

export interface TaskSession {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  taskName: string;
  startTime: string; // ISO string
  endTime: string | null; // ISO string or null if currently running
  durationSeconds: number;
  description: string;
  productivityScore: number; // calculated score
  activeLinks?: string[];
  searchEngineQueries?: string[];
  activityHistory?: { time: string; productivity: number; activeWindow: string }[];
}

export interface BreakLog {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string; // e.g., 'Coffee Break' | 'Lunch Break' | 'Short Rest' | 'Personal'
  startTime: string; // ISO string
  endTime: string | null; // null if active
  durationSeconds: number;
}

export type TimeClaimStatus = 'Pending' | 'Approved' | 'Rejected';

export interface TimeClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  taskName: string;
  date: string; // YYYY-MM-DD
  hours: number;
  reason: string;
  status: TimeClaimStatus;
  submittedAt: string; // ISO string
  rejectionReason?: string;
}

export interface ProductivityDataPoint {
  time: string;
  "Sarah Chen": number;
  "Alex Rivera": number;
  "Marcus Vance": number;
  "Emily Wong": number;
}

export interface ProjectHoursDataPoint {
  name: string;
  hours: number;
  budget: number;
}


