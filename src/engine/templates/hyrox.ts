import type { TrackPhase, Resource } from '../../types';

export const hyroxPhases: TrackPhase[] = [
  {
    id: 'hyrox-p1',
    name: 'Phase 1: Foundation & Activation',
    description: 'Build the base. Pilates, aerobic conditioning, and movement quality.',
    durationWeeks: 4,
    sessions: [
      { id: 'hyrox-p1-mon', dayOfWeek: 1, title: 'Pilates Intro', description: 'Core activation and mobility foundations.', xpReward: 50 },
      { id: 'hyrox-p1-wed', dayOfWeek: 3, title: 'Zone 2 Run', description: '30 min easy aerobic run — conversational pace.', xpReward: 60 },
      { id: 'hyrox-p1-fri', dayOfWeek: 5, title: 'Pilates + Core', description: 'Progressive pilates session focusing on stability.', xpReward: 50 },
      { id: 'hyrox-p1-sat', dayOfWeek: 6, title: 'Long Slow Run', description: '45–60 min easy pace. Build endurance base.', xpReward: 80 },
    ],
  },
  {
    id: 'hyrox-p2',
    name: 'Phase 2: Aerobic Development',
    description: 'Increase volume. Introduce Hyrox stations at low intensity.',
    durationWeeks: 4,
    sessions: [
      { id: 'hyrox-p2-mon', dayOfWeek: 1, title: 'Station Intro', description: 'Light SkiErg + rowing technique work.', xpReward: 70 },
      { id: 'hyrox-p2-wed', dayOfWeek: 3, title: 'Tempo Run', description: '5km at comfortably hard effort.', xpReward: 80 },
      { id: 'hyrox-p2-fri', dayOfWeek: 5, title: 'Sled + Sandbag', description: 'Sled push technique + sandbag lunges intro.', xpReward: 80 },
      { id: 'hyrox-p2-sat', dayOfWeek: 6, title: 'Long Run', description: '60–75 min aerobic run.', xpReward: 100 },
    ],
  },
  {
    id: 'hyrox-p3',
    name: 'Phase 3: Hyrox Specificity',
    description: 'All 8 stations. Run/station intervals. Build race-specific fitness.',
    durationWeeks: 4,
    sessions: [
      { id: 'hyrox-p3-mon', dayOfWeek: 1, title: 'Full Station Circuit', description: 'All 8 Hyrox stations at 70% effort.', xpReward: 100 },
      { id: 'hyrox-p3-wed', dayOfWeek: 3, title: 'Run/Station Intervals', description: '1km run + station x4. Build the race pattern.', xpReward: 120 },
      { id: 'hyrox-p3-fri', dayOfWeek: 5, title: 'Strength Focus', description: 'Wall balls + farmer carry + burpees at pace.', xpReward: 100 },
      { id: 'hyrox-p3-sat', dayOfWeek: 6, title: 'Race Simulation', description: 'Mini Hyrox: 4km run + 4 stations.', xpReward: 150 },
    ],
  },
  {
    id: 'hyrox-p4',
    name: 'Phase 4: Race Simulation',
    description: 'Full race-distance training. Peak fitness. Lock in the 1:30 split plan.',
    durationWeeks: 3,
    sessions: [
      { id: 'hyrox-p4-mon', dayOfWeek: 1, title: 'Full Race Sim', description: '8km run + all 8 stations. Race effort.', xpReward: 200 },
      { id: 'hyrox-p4-thu', dayOfWeek: 4, title: 'Station PB Attempts', description: 'Attack personal bests on 3 stations.', xpReward: 120 },
      { id: 'hyrox-p4-sat', dayOfWeek: 6, title: 'Race Pace Run', description: '8km at target race pace. 6:30/km.', xpReward: 150 },
    ],
  },
  {
    id: 'hyrox-p5',
    name: 'Phase 5: Taper & Race Prep',
    description: 'Reduce volume. Stay sharp. Mental preparation.',
    durationWeeks: 2,
    sessions: [
      { id: 'hyrox-p5-mon', dayOfWeek: 1, title: 'Light Stations', description: 'Easy station work — feel good, no strain.', xpReward: 60 },
      { id: 'hyrox-p5-wed', dayOfWeek: 3, title: 'Short Sharpener Run', description: '3km with 4x100m strides. Stay fast.', xpReward: 60 },
      { id: 'hyrox-p5-fri', dayOfWeek: 5, title: 'Race Prep Walk-Through', description: 'Light movement, visualise race day, rest.', xpReward: 40 },
    ],
  },
];

export const hyroxResources: Omit<Resource, 'id' | 'trackId' | 'createdAt'>[] = [
  { title: 'Hyrox Official YouTube', url: 'https://www.youtube.com/@HYROXofficial', notes: 'Race footage and technique tips.', source: 'preloaded' },
  { title: 'How to Train for Hyrox (Beginners)', url: 'https://www.youtube.com/watch?v=GjHBqKcUVz4', notes: 'Full breakdown of all 8 stations.', source: 'preloaded' },
  { title: 'SkiErg Technique Guide', url: 'https://www.youtube.com/watch?v=pKr6pkCBkfg', notes: 'Proper pull mechanics for efficiency.', source: 'preloaded' },
  { title: 'Wall Ball Technique', url: 'https://www.youtube.com/watch?v=fpUD0mcFp_0', notes: 'Depth, height, and pacing strategy.', source: 'preloaded' },
  { title: 'Target 1:30 Split Strategy', url: '', notes: 'Running: 52:00 (8×1km @ 6:30/km). Stations: 35:00 (~4.5 min avg). Transitions: 3:00. Target: sub 90 minutes.', source: 'preloaded' },
];
