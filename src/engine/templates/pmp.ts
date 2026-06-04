import type { TrackPhase, Resource } from '../../types';

export const pmpPhases: TrackPhase[] = [
  {
    id: 'pmp-p1',
    name: 'Foundations',
    description: 'PMBOK fundamentals. Project initiation and planning domains.',
    durationWeeks: 4,
    sessions: [
      { id: 'pmp-p1-1', dayOfWeek: 1, title: 'Chapter 1: Introduction', description: 'Project management overview and PMI framework.', xpReward: 40 },
      { id: 'pmp-p1-2', dayOfWeek: 2, title: 'Chapter 2: Environment', description: 'Project environment, governance, and stakeholders.', xpReward: 40 },
      { id: 'pmp-p1-3', dayOfWeek: 3, title: 'Chapter 3: Role of PM', description: 'Leadership, communication, and PM competencies.', xpReward: 40 },
      { id: 'pmp-p1-4', dayOfWeek: 4, title: 'Chapter 4: Project Integration', description: 'Integration management across the project lifecycle.', xpReward: 50 },
      { id: 'pmp-p1-5', dayOfWeek: 5, title: 'Mock Quiz 1', description: 'Chapters 1–4 practice questions.', xpReward: 60 },
    ],
  },
  {
    id: 'pmp-p2',
    name: 'Core Domains',
    description: 'Scope, schedule, cost, quality, and resource management.',
    durationWeeks: 5,
    sessions: [
      { id: 'pmp-p2-1', dayOfWeek: 1, title: 'Chapter 5: Scope Management', description: 'WBS, requirements, and scope validation.', xpReward: 50 },
      { id: 'pmp-p2-2', dayOfWeek: 2, title: 'Chapter 6: Schedule Management', description: 'Critical path, float, and schedule compression.', xpReward: 50 },
      { id: 'pmp-p2-3', dayOfWeek: 3, title: 'Chapter 7: Cost Management', description: 'Earned value, budgeting, and cost control.', xpReward: 50 },
      { id: 'pmp-p2-4', dayOfWeek: 4, title: 'Chapter 8: Quality Management', description: 'Quality assurance vs control, audits.', xpReward: 50 },
      { id: 'pmp-p2-5', dayOfWeek: 5, title: 'Chapter 9: Resources', description: 'Team development, RACI, resource planning.', xpReward: 50 },
      { id: 'pmp-p2-6', dayOfWeek: 1, title: 'Mock Quiz 2', description: 'Chapters 5–9 practice questions.', xpReward: 80 },
    ],
  },
  {
    id: 'pmp-p3',
    name: 'Advanced Domains',
    description: 'Risk, procurement, stakeholder management, and agile.',
    durationWeeks: 4,
    sessions: [
      { id: 'pmp-p3-1', dayOfWeek: 1, title: 'Chapter 10: Communications', description: 'Communication planning, methods, and reporting.', xpReward: 50 },
      { id: 'pmp-p3-2', dayOfWeek: 2, title: 'Chapter 11: Risk Management', description: 'Risk identification, analysis, and response planning.', xpReward: 60 },
      { id: 'pmp-p3-3', dayOfWeek: 3, title: 'Chapter 12: Procurement', description: 'Contract types, vendor management, closure.', xpReward: 50 },
      { id: 'pmp-p3-4', dayOfWeek: 4, title: 'Chapter 13: Stakeholders', description: 'Stakeholder engagement and management.', xpReward: 50 },
      { id: 'pmp-p3-5', dayOfWeek: 5, title: 'Agile/Hybrid Methods', description: 'Scrum, Kanban, hybrid approaches for PMP.', xpReward: 70 },
    ],
  },
  {
    id: 'pmp-p4',
    name: 'Exam Preparation',
    description: 'Full mock exams, weak area review, and exam-day strategy.',
    durationWeeks: 3,
    sessions: [
      { id: 'pmp-p4-1', dayOfWeek: 1, title: 'Full Mock Exam 1', description: '180 questions. 4 hours. Log your score.', xpReward: 150 },
      { id: 'pmp-p4-2', dayOfWeek: 3, title: 'Weak Area Review', description: 'Focus on your lowest-scoring domains.', xpReward: 80 },
      { id: 'pmp-p4-3', dayOfWeek: 5, title: 'Full Mock Exam 2', description: '180 questions. 4 hours. Target improvement.', xpReward: 150 },
      { id: 'pmp-p4-4', dayOfWeek: 2, title: 'Final Review', description: 'Flashcards, formulas, and exam-day prep.', xpReward: 80 },
    ],
  },
];

export const pmpResources: Omit<Resource, 'id' | 'trackId' | 'createdAt'>[] = [
  { title: 'PMI Official Study Materials', url: 'https://www.pmi.org/certifications/project-management-pmp/earn-the-pmp/pmp-exam-preparation', notes: 'Official PMI exam prep resources.', source: 'preloaded' },
  { title: 'PrepCast PMP Simulator', url: 'https://www.pm-prepcast.com/pmp-exam-simulator', notes: 'Best mock exam simulator. 1800+ questions.', source: 'preloaded' },
  { title: 'PMBOK Guide Overview (YouTube)', url: 'https://www.youtube.com/watch?v=GC7pN8Mjot8', notes: 'Quick PMBOK 7th edition overview.', source: 'preloaded' },
  { title: 'Andrew Ramdayal PMP Tips', url: 'https://www.youtube.com/@TIAEducation', notes: 'Best free PMP exam tips on YouTube.', source: 'preloaded' },
  { title: 'PMP Formula Guide', url: 'https://www.project-management-prepcast.com/pmp-exam/pmp-exam-formula-study-guide', notes: 'All EVM and schedule formulas.', source: 'preloaded' },
];
