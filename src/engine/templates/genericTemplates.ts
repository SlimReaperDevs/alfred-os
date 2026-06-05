import type { TrackPhase, Resource, TrackTemplateType } from '../../types';

export interface TemplateDefinition {
  type: TrackTemplateType;
  name: string;
  description: string;
  popular: boolean;
  emoji: string;
  phases: TrackPhase[];
  resources: Omit<Resource, 'id' | 'trackId' | 'createdAt'>[];
}

const marathonPhases: TrackPhase[] = [
  { id: 'mar-p1', name: 'Base Building', description: 'Build your aerobic base. Run 4 days a week.', durationWeeks: 8,
    sessions: [
      { id: 'mar-p1-1', dayOfWeek: 1, title: 'Easy Run', description: '30–40 min easy pace.', xpReward: 50 },
      { id: 'mar-p1-2', dayOfWeek: 3, title: 'Tempo Run', description: '20 min at comfortably hard effort.', xpReward: 70 },
      { id: 'mar-p1-3', dayOfWeek: 5, title: 'Easy Run', description: '30 min easy.', xpReward: 50 },
      { id: 'mar-p1-4', dayOfWeek: 6, title: 'Long Run', description: 'Build to 90 min by end of phase.', xpReward: 100 },
    ],
  },
  { id: 'mar-p2', name: 'Build Phase', description: 'Increase long run. Introduce race pace.', durationWeeks: 8,
    sessions: [
      { id: 'mar-p2-1', dayOfWeek: 1, title: 'Easy Run', description: '45 min easy.', xpReward: 60 },
      { id: 'mar-p2-2', dayOfWeek: 3, title: 'Race Pace Intervals', description: '5×1km at marathon goal pace.', xpReward: 90 },
      { id: 'mar-p2-3', dayOfWeek: 5, title: 'Easy Run', description: '40 min easy.', xpReward: 60 },
      { id: 'mar-p2-4', dayOfWeek: 6, title: 'Long Run', description: 'Build to 30km.', xpReward: 150 },
    ],
  },
  { id: 'mar-p3', name: 'Taper', description: 'Reduce volume. Stay sharp for race day.', durationWeeks: 3,
    sessions: [
      { id: 'mar-p3-1', dayOfWeek: 1, title: 'Easy Run', description: '30 min easy.', xpReward: 40 },
      { id: 'mar-p3-2', dayOfWeek: 3, title: 'Short Tempo', description: '15 min at race pace.', xpReward: 60 },
      { id: 'mar-p3-3', dayOfWeek: 6, title: 'Race Prep Run', description: '10km easy. Final long effort.', xpReward: 60 },
    ],
  },
];

const languagePhases: TrackPhase[] = [
  { id: 'lang-p1', name: 'Foundations', description: 'Alphabet, basic vocabulary, and simple sentences.', durationWeeks: 4,
    sessions: [
      { id: 'lang-p1-1', dayOfWeek: 1, title: 'Vocabulary Session', description: '20 new words. Review flashcards.', xpReward: 30 },
      { id: 'lang-p1-2', dayOfWeek: 3, title: 'Grammar Fundamentals', description: 'Basic sentence structure and verb conjugation.', xpReward: 40 },
      { id: 'lang-p1-3', dayOfWeek: 5, title: 'Listening Practice', description: '20 min native content — podcasts or shows.', xpReward: 30 },
      { id: 'lang-p1-4', dayOfWeek: 0, title: 'Speaking Practice', description: 'Speak aloud for 15 min. Record yourself.', xpReward: 50 },
    ],
  },
  { id: 'lang-p2', name: 'Intermediate', description: 'Expand vocabulary. Start conversations.', durationWeeks: 8,
    sessions: [
      { id: 'lang-p2-1', dayOfWeek: 1, title: 'Vocabulary Expansion', description: '30 new words from target topics.', xpReward: 40 },
      { id: 'lang-p2-2', dayOfWeek: 3, title: 'Conversation Practice', description: 'Language exchange or tutor session.', xpReward: 80 },
      { id: 'lang-p2-3', dayOfWeek: 5, title: 'Reading', description: 'Read native content for 20 min.', xpReward: 40 },
      { id: 'lang-p2-4', dayOfWeek: 0, title: 'Immersion Day', description: '1 hour of native media without subtitles.', xpReward: 60 },
    ],
  },
];

const awsPhases: TrackPhase[] = [
  { id: 'aws-p1', name: 'Cloud Foundations', description: 'Core AWS services, IAM, and cloud concepts.', durationWeeks: 4,
    sessions: [
      { id: 'aws-p1-1', dayOfWeek: 1, title: 'IAM & Security', description: 'Users, roles, policies, and MFA.', xpReward: 50 },
      { id: 'aws-p1-2', dayOfWeek: 3, title: 'Compute: EC2', description: 'Instance types, AMIs, auto-scaling.', xpReward: 50 },
      { id: 'aws-p1-3', dayOfWeek: 5, title: 'Storage: S3 & EBS', description: 'Object vs block storage. Lifecycle policies.', xpReward: 50 },
      { id: 'aws-p1-4', dayOfWeek: 0, title: 'Mock Quiz', description: 'Practice questions on completed topics.', xpReward: 70 },
    ],
  },
  { id: 'aws-p2', name: 'Core Services', description: 'Networking, databases, and serverless.', durationWeeks: 4,
    sessions: [
      { id: 'aws-p2-1', dayOfWeek: 1, title: 'Networking: VPC', description: 'Subnets, routing, security groups.', xpReward: 60 },
      { id: 'aws-p2-2', dayOfWeek: 3, title: 'Databases: RDS & DynamoDB', description: 'Relational vs NoSQL on AWS.', xpReward: 60 },
      { id: 'aws-p2-3', dayOfWeek: 5, title: 'Serverless: Lambda & API Gateway', description: 'Event-driven architecture.', xpReward: 70 },
      { id: 'aws-p2-4', dayOfWeek: 0, title: 'Practice Exam', description: '65 question mock exam.', xpReward: 100 },
    ],
  },
];

const readingPhases: TrackPhase[] = [
  { id: 'read-p1', name: 'Current Book', description: 'Read consistently. Track your progress.', durationWeeks: 4,
    sessions: [
      { id: 'read-p1-1', dayOfWeek: 1, title: 'Reading Session', description: 'Read for 30 min. No distractions.', xpReward: 30 },
      { id: 'read-p1-2', dayOfWeek: 3, title: 'Reading Session', description: 'Read for 30 min.', xpReward: 30 },
      { id: 'read-p1-3', dayOfWeek: 5, title: 'Reading Session', description: 'Read for 30 min.', xpReward: 30 },
      { id: 'read-p1-4', dayOfWeek: 0, title: 'Book Notes', description: 'Write key takeaways and insights from the week.', xpReward: 50 },
    ],
  },
];

const cyclingPhases: TrackPhase[] = [
  { id: 'cyc-p1', name: 'Base Fitness', description: 'Build aerobic base. 3 rides per week.', durationWeeks: 6,
    sessions: [
      { id: 'cyc-p1-1', dayOfWeek: 2, title: 'Easy Ride', description: '60 min Zone 2. Steady effort.', xpReward: 60 },
      { id: 'cyc-p1-2', dayOfWeek: 4, title: 'Interval Ride', description: '4×5 min hard efforts.', xpReward: 80 },
      { id: 'cyc-p1-3', dayOfWeek: 6, title: 'Long Ride', description: 'Build to 3 hours by end of phase.', xpReward: 120 },
    ],
  },
];

/** Template types defined in this library file (everything except the three Popular templates). */
type GenericTemplateType = Exclude<TrackTemplateType, 'hyrox' | 'pmp' | 'product_owner'>;

export const TEMPLATE_LIBRARY: Record<GenericTemplateType, TemplateDefinition> = {
  marathon: {
    type: 'marathon', name: 'Marathon Training', description: 'Go from base fitness to race day.', popular: false, emoji: '🏃',
    phases: marathonPhases, resources: [
      { title: 'Hal Higdon Marathon Plans', url: 'https://www.halhigdon.com/training-programs/marathon-training/', notes: 'Free beginner through advanced plans.', source: 'preloaded' },
      { title: 'Nike Run Club', url: 'https://www.nike.com/nrc-app', notes: 'Free guided runs and training plans.', source: 'preloaded' },
    ],
  },
  cycling: {
    type: 'cycling', name: 'Cycling Event', description: 'Train for a gran fondo or cycling race.', popular: false, emoji: '🚴',
    phases: cyclingPhases, resources: [
      { title: 'TrainingPeaks', url: 'https://www.trainingpeaks.com', notes: 'Cycling training plans and analytics.', source: 'preloaded' },
    ],
  },
  language: {
    type: 'language', name: 'Language Learning', description: 'Learn a new language through daily immersion.', popular: false, emoji: '🗣️',
    phases: languagePhases, resources: [
      { title: 'Anki Flashcards', url: 'https://apps.ankiweb.net', notes: 'Best spaced repetition system.', source: 'preloaded' },
      { title: 'iTalki', url: 'https://www.italki.com', notes: 'Find native speaker tutors.', source: 'preloaded' },
    ],
  },
  aws_cert: {
    type: 'aws_cert', name: 'AWS Certification', description: 'Pass the AWS Solutions Architect Associate.', popular: false, emoji: '☁️',
    phases: awsPhases, resources: [
      { title: 'AWS Skill Builder', url: 'https://skillbuilder.aws', notes: 'Official AWS training platform.', source: 'preloaded' },
      { title: 'Stephane Maarek AWS Course', url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/', notes: 'Best Udemy course for AWS SAA.', source: 'preloaded' },
    ],
  },
  reading: {
    type: 'reading', name: 'Reading Challenge', description: 'Build a consistent reading habit.', popular: false, emoji: '📖',
    phases: readingPhases, resources: [
      { title: 'Goodreads', url: 'https://www.goodreads.com', notes: 'Track your reading list and progress.', source: 'preloaded' },
    ],
  },
  custom: {
    type: 'custom', name: 'Custom Track', description: 'Define your own goal from scratch.', popular: false, emoji: '⚡',
    phases: [
      { id: 'custom-p1', name: 'Phase 1', description: 'Your first phase.', durationWeeks: 4,
        sessions: [
          { id: 'custom-p1-1', dayOfWeek: 1, title: 'Session', description: 'Your session.', xpReward: 50 },
        ],
      },
    ],
    resources: [],
  },
};
