import type { TrackPhase, Resource } from '../../types';

export const productOwnerPhases: TrackPhase[] = [
  {
    id: 'po-p1',
    name: 'Frontend Fundamentals',
    description: 'HTML, CSS, JavaScript — the language of the web.',
    durationWeeks: 4,
    sessions: [
      { id: 'po-p1-1', dayOfWeek: 1, title: 'HTML Structure', description: 'Semantic HTML, document structure, forms.', xpReward: 40 },
      { id: 'po-p1-2', dayOfWeek: 2, title: 'CSS Foundations', description: 'Box model, flexbox, grid, responsive design.', xpReward: 40 },
      { id: 'po-p1-3', dayOfWeek: 3, title: 'JavaScript Basics', description: 'Variables, functions, DOM manipulation.', xpReward: 50 },
      { id: 'po-p1-4', dayOfWeek: 4, title: 'Build Something', description: 'Ship a small project. Log it in the Vibe Coding log.', xpReward: 100 },
    ],
  },
  {
    id: 'po-p2',
    name: 'React & Modern Tooling',
    description: 'React components, state, hooks, and modern development workflow.',
    durationWeeks: 4,
    sessions: [
      { id: 'po-p2-1', dayOfWeek: 1, title: 'React Fundamentals', description: 'Components, props, JSX, and virtual DOM.', xpReward: 60 },
      { id: 'po-p2-2', dayOfWeek: 2, title: 'State & Hooks', description: 'useState, useEffect, and context.', xpReward: 60 },
      { id: 'po-p2-3', dayOfWeek: 3, title: 'API Integration', description: 'Fetch, async/await, and REST API consumption.', xpReward: 70 },
      { id: 'po-p2-4', dayOfWeek: 4, title: 'Build Something', description: 'Ship a React project. Log it.', xpReward: 120 },
    ],
  },
  {
    id: 'po-p3',
    name: 'Product Owner Practice',
    description: 'Agile, backlog management, user stories, and stakeholder comms.',
    durationWeeks: 4,
    sessions: [
      { id: 'po-p3-1', dayOfWeek: 1, title: 'Agile & Scrum', description: 'Sprint ceremonies, roles, and artefacts.', xpReward: 50 },
      { id: 'po-p3-2', dayOfWeek: 2, title: 'User Stories', description: 'Writing effective stories, acceptance criteria.', xpReward: 50 },
      { id: 'po-p3-3', dayOfWeek: 3, title: 'Backlog Refinement', description: 'Prioritisation frameworks: MoSCoW, RICE.', xpReward: 50 },
      { id: 'po-p3-4', dayOfWeek: 4, title: 'Stakeholder Management', description: 'Communication, alignment, and conflict resolution.', xpReward: 60 },
    ],
  },
];

export const productOwnerResources: Omit<Resource, 'id' | 'trackId' | 'createdAt'>[] = [
  { title: 'The Odin Project (Free)', url: 'https://www.theodinproject.com', notes: 'Best free full-stack curriculum. Start here.', source: 'preloaded' },
  { title: 'React Official Docs', url: 'https://react.dev', notes: 'The definitive React learning resource.', source: 'preloaded' },
  { title: 'Scrum Guide', url: 'https://scrumguides.org/scrum-guide.html', notes: 'Official Scrum Guide — free PDF.', source: 'preloaded' },
  { title: 'ProductPlan PO Resources', url: 'https://www.productplan.com/learn/product-owner/', notes: 'Product owner role guide and templates.', source: 'preloaded' },
  { title: 'CSS Tricks', url: 'https://css-tricks.com', notes: 'Reference for CSS patterns and techniques.', source: 'preloaded' },
];
