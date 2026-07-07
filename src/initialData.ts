import { Employee, Project, TaskSession, BreakLog, TimeClaim } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'AR29061',
    name: 'Manohar Donakonda',
    email: 'manohar@around29.io',
    role: 'Product Owner & Architect',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
    hourlyRate: 120,
    productivityScore: 98,
    status: 'Active',
    activeProjectName: 'Nova Redesign',
    activeTaskName: 'Sprint Validation',
    totalHoursTracked: 198.5,
  },
  {
    id: 'emp-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@timechamp.io',
    role: 'Lead UI/UX Designer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120',
    hourlyRate: 85,
    productivityScore: 94,
    status: 'Active',
    activeProjectName: 'Nova Redesign',
    activeTaskName: 'Interactive Prototyping',
    totalHoursTracked: 142.5,
  },
  {
    id: 'emp-2',
    name: 'Alex Rivera',
    email: 'alex.rivera@timechamp.io',
    role: 'Senior Frontend Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
    hourlyRate: 95,
    productivityScore: 88,
    status: 'Active',
    activeProjectName: 'SaaS Core Dashboard',
    activeTaskName: 'Integrating State Machine',
    totalHoursTracked: 118.2,
  },
  {
    id: 'emp-3',
    name: 'Marcus Vance',
    email: 'marcus.vance@timechamp.io',
    role: 'DevOps & Backend Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
    hourlyRate: 110,
    productivityScore: 72,
    status: 'Idle',
    activeProjectName: 'Database Migration',
    activeTaskName: 'Analyzing Slow Queries',
    totalHoursTracked: 95.8,
  },
  {
    id: 'emp-4',
    name: 'Emily Wong',
    email: 'emily.wong@timechamp.io',
    role: 'Product Specialist',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120&h=120',
    hourlyRate: 75,
    productivityScore: 91,
    status: 'Meeting',
    activeProjectName: 'Nova Redesign',
    activeTaskName: 'Sprint Review & Feedback',
    totalHoursTracked: 164.0,
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Nova Redesign',
    clientName: 'Aether Corp',
    budgetHours: 250,
    spentHours: 184.5,
    color: 'emerald', // emerald-500
    tasks: ['Wireframing', 'User Research', 'Interactive Prototyping', 'Component Library UI', 'Sprint Review & Feedback']
  },
  {
    id: 'proj-2',
    name: 'SaaS Core Dashboard',
    clientName: 'Stellar FinTech',
    budgetHours: 300,
    spentHours: 198.2,
    color: 'sky', // sky-500
    tasks: ['Integrating State Machine', 'Performance Profiling', 'Interactive Area Charts', 'OAuth Flow Mock', 'Theme Setup']
  },
  {
    id: 'proj-3',
    name: 'Database Migration',
    clientName: 'Alpha Systems',
    budgetHours: 120,
    spentHours: 95.8,
    color: 'amber', // amber-500
    tasks: ['Schema Review', 'Analyzing Slow Queries', 'Migration Script Testing', 'Rollback Validation', 'Index Tuning']
  },
  {
    id: 'proj-4',
    name: 'Acme Mobile App',
    clientName: 'Acme Corp',
    budgetHours: 180,
    spentHours: 42.0,
    color: 'indigo', // indigo-500
    tasks: ['Architecture Setup', 'Authentication Guard', 'Push Notifications', 'App Store Setup', 'Feedback Loops']
  }
];

// Seed some historic sessions for beautiful charts (all complete)
export const INITIAL_SESSIONS: TaskSession[] = [
  {
    id: 'sess-1',
    employeeId: 'emp-1',
    employeeName: 'Sarah Chen',
    projectId: 'proj-1',
    projectName: 'Nova Redesign',
    taskName: 'Wireframing',
    startTime: '2026-07-06T09:00:00Z',
    endTime: '2026-07-06T12:30:00Z',
    durationSeconds: 12600, // 3.5 hrs
    description: 'Developed mobile and desktop wireframes for the settings panel.',
    productivityScore: 96,
    activeLinks: [
      'https://figma.com/file/nova-redesign-wireframes',
      'https://dribbble.com/search/settings-panel-ui'
    ],
    searchEngineQueries: [
      'modern settings page layout figma',
      'dashboard settings drawer design patterns'
    ]
  },
  {
    id: 'sess-2',
    employeeId: 'emp-2',
    employeeName: 'Alex Rivera',
    projectId: 'proj-2',
    projectName: 'SaaS Core Dashboard',
    taskName: 'Performance Profiling',
    startTime: '2026-07-06T10:00:00Z',
    endTime: '2026-07-06T14:45:00Z',
    durationSeconds: 17100, // 4.75 hrs
    description: 'Diagnosed slow re-renders in the nested list layout and optimized keys.',
    productivityScore: 92,
    activeLinks: [
      'https://github.com/stellar-fintech/saas-core/issues/109',
      'https://react.dev/reference/react/memo'
    ],
    searchEngineQueries: [
      'react list re-render optimization keys',
      'measure performance custom react hook profiling'
    ]
  },
  {
    id: 'sess-3',
    employeeId: 'emp-3',
    employeeName: 'Marcus Vance',
    projectId: 'proj-3',
    projectName: 'Database Migration',
    taskName: 'Schema Review',
    startTime: '2026-07-06T08:30:00Z',
    endTime: '2026-07-06T12:00:00Z',
    durationSeconds: 12600, // 3.5 hrs
    description: 'Reviewed constraints on the user metadata schema and adjusted indexes.',
    productivityScore: 81,
    activeLinks: [
      'https://postgresql.org/docs/current/indexes',
      'https://console.cloud.google.com/sql/instances/saas-db'
    ],
    searchEngineQueries: [
      'postgres user metadata schema indexing guidelines',
      'optimize slow queries join table cluster key'
    ]
  },
  {
    id: 'sess-4',
    employeeId: 'emp-4',
    employeeName: 'Emily Wong',
    projectId: 'proj-1',
    projectName: 'Nova Redesign',
    taskName: 'User Research',
    startTime: '2026-07-06T13:00:00Z',
    endTime: '2026-07-06T17:00:00Z',
    durationSeconds: 14400, // 4 hrs
    description: 'Conducted interviews with 5 key stakeholders and consolidated design friction points.',
    productivityScore: 95,
    activeLinks: [
      'https://miro.com/app/board/nova-stakeholder-interviews',
      'https://nngroup.com/articles/design-friction/'
    ],
    searchEngineQueries: [
      'stakeholder interview checklist product management',
      'how to map design friction points'
    ]
  },
  {
    id: 'sess-5',
    employeeId: 'emp-1',
    employeeName: 'Sarah Chen',
    projectId: 'proj-1',
    projectName: 'Nova Redesign',
    taskName: 'Component Library UI',
    startTime: '2026-07-07T08:00:00Z',
    endTime: '2026-07-07T11:00:00Z',
    durationSeconds: 10800, // 3 hrs
    description: 'Created responsive card headers and dialog variants.',
    productivityScore: 93,
    activeLinks: [
      'https://tailwindui.com/components/application-ui/page-examples/detail-screens',
      'https://figma.com/file/component-library-v2'
    ],
    searchEngineQueries: [
      'flexible card headers tailwind classes',
      'dialog component overlay accessible patterns'
    ]
  },
  {
    id: 'sess-6',
    employeeId: 'emp-2',
    employeeName: 'Alex Rivera',
    projectId: 'proj-2',
    projectName: 'SaaS Core Dashboard',
    taskName: 'OAuth Flow Mock',
    startTime: '2026-07-07T08:30:00Z',
    endTime: '2026-07-07T12:00:00Z',
    durationSeconds: 12600, // 3.5 hrs
    description: 'Drafted OAuth consent layout triggers and mock redirect actions.',
    productivityScore: 86,
    activeLinks: [
      'https://oauth.net/2/grant-types/authorization-code/',
      'https://github.com/stellar-fintech/saas-core/pull/242'
    ],
    searchEngineQueries: [
      'mock oauth flow locally preview client',
      'pkce authorization code flow react setup'
    ]
  }
];

export const INITIAL_BREAKS: BreakLog[] = [
  {
    id: 'break-1',
    employeeId: 'emp-1',
    employeeName: 'Sarah Chen',
    type: 'Lunch Break',
    startTime: '2026-07-07T12:00:00Z',
    endTime: '2026-07-07T12:45:00Z',
    durationSeconds: 2700
  },
  {
    id: 'break-2',
    employeeId: 'emp-2',
    employeeName: 'Alex Rivera',
    type: 'Coffee Break',
    startTime: '2026-07-07T10:15:00Z',
    endTime: '2026-07-07T10:30:00Z',
    durationSeconds: 900
  }
];

export const INITIAL_CLAIMS: TimeClaim[] = [
  {
    id: 'claim-1',
    employeeId: 'emp-3',
    employeeName: 'Marcus Vance',
    projectId: 'proj-3',
    projectName: 'Database Migration',
    taskName: 'Migration Script Testing',
    date: '2026-07-06',
    hours: 4.5,
    reason: 'Off-site system cutover work completed late at night.',
    status: 'Pending',
    submittedAt: '2026-07-06T23:00:00Z'
  },
  {
    id: 'claim-2',
    employeeId: 'emp-4',
    employeeName: 'Emily Wong',
    projectId: 'proj-1',
    projectName: 'Nova Redesign',
    taskName: 'User Research',
    date: '2026-07-05',
    hours: 2.0,
    reason: 'Interviews ran late with executive team.',
    status: 'Approved',
    submittedAt: '2026-07-05T18:30:00Z'
  }
];

