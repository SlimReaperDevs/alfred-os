// ─── User & Character ────────────────────────────────────────────────────────

export type Honorific = 'Sir' | 'Ma\'am' | 'Mx' | 'Commander' | string;

export interface CharacterData {
  name: string;
  career: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  hobbies: string;
  backstory: string;
  charisma: number; // 8–18
}

export interface User {
  id: string;
  email: string;
  honorific: Honorific;
  displayName: string;
  characterData: CharacterData;
  onboardingComplete: boolean;
  createdAt: string;
}

// ─── Tracks ──────────────────────────────────────────────────────────────────

export type TrackTemplateType =
  | 'hyrox'
  | 'pmp'
  | 'product_owner'
  | 'marathon'
  | 'cycling'
  | 'language'
  | 'aws_cert'
  | 'reading'
  | 'custom';

export type TrackStatus = 'active' | 'archived';

export interface TrackPhase {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  sessions: TrackSession[];
}

export interface TrackSession {
  id: string;
  dayOfWeek: number; // 0=Sun … 6=Sat
  title: string;
  description: string;
  exercises?: Exercise[];
  xpReward: number;
}

export interface Exercise {
  name: string;
  sets?: string;
  reps?: string;
  duration?: string;
  notes?: string;
}

export interface KeyDate {
  label: string;
  date: string; // ISO
}

export interface Track {
  id: string;
  userId: string;
  templateType: TrackTemplateType;
  name: string;
  currentPhaseIndex: number;
  keyDates: KeyDate[];
  status: TrackStatus;
  startDate: string;
  createdAt: string;
}

// ─── Activity ────────────────────────────────────────────────────────────────

export type ActionType =
  | 'session_complete'
  | 'chapter_complete'
  | 'mock_score'
  | 'station_pb'
  | 'run_log'
  | 'build_log'
  | 'quest_complete'
  | 'side_quest_complete'
  | 'bounty_complete'
  | 'quest_missed';

export interface ActivityEntry {
  id: string;
  userId: string;
  trackId: string;
  actionType: ActionType;
  metadata: Record<string, unknown>;
  xpAwarded: number;
  loggedAt: string;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface NotificationPrefs {
  morningBriefing: boolean;
  eveningWarning: boolean;
  streakAtRisk: boolean;
  milestones: boolean;
  rewardAlerts: boolean;
  morningHour: number;
  eveningHour: number;
}

export interface WidgetLayout {
  order: string[];
  hidden: string[];
}

export interface Settings {
  userId: string;
  notificationPrefs: NotificationPrefs;
  widgetLayout: WidgetLayout;
  updatedAt: string;
}

// ─── Resources ───────────────────────────────────────────────────────────────

export type ResourceSource = 'preloaded' | 'user';

export interface Resource {
  id: string;
  trackId: string;
  title: string;
  url: string;
  notes: string;
  source: ResourceSource;
  createdAt: string;
}

// ─── Quests ──────────────────────────────────────────────────────────────────

export type QuestType = 'compulsory' | 'side' | 'bounty';
export type QuestStatus = 'active' | 'completed' | 'missed' | 'expired';

export interface Quest {
  id: string;
  userId: string;
  trackId: string;
  type: QuestType;
  title: string;
  description: string;
  xpReward: number;
  xpPenalty: number;
  status: QuestStatus;
  dueDate: string; // ISO — end of day for daily, end of week for bounty
  completedAt: string | null;
}

// ─── Lore & Rewards ──────────────────────────────────────────────────────────

export interface LoreDrop {
  id: string;
  title: string;
  content: string;
  unlocked: boolean;
}

export interface Title {
  id: string;
  name: string;
  description: string;
  unlockCondition: string;
  unlocked: boolean;
}

// ─── Character State ─────────────────────────────────────────────────────────

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface CharacterState {
  totalXp: number;
  overallLevel: number;
  trainingLevel: number;
  knowledgeLevel: number;
  abilityScores: AbilityScores;
  unlockedProficiencies: string[];
  unlockedTitles: Title[];
  unlockedLoreDrops: LoreDrop[];
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'alfred';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}
