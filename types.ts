
export interface Location {
  lat: number;
  lng: number;
}

export interface Task {
  id: string;
  title: string;
  problem: string;
  taskA: string;
  taskB: string;
  secretCode: string;
  location: Location;
  status: 'active' | 'matched' | 'completed';
  timestamp: number;
  initiatorImage?: string;
  resultImage?: string;
}

export interface Echo {
  id: string;
  observation: string;
  image?: string;
  amplification: string;
  timestamp: number;
  location?: Location;
}

export type AppMode = 'home' | 'initiate' | 'resonate' | 'admin' | 'task-details' | 'echo';

export interface SocialMetrics {
  totalInteractions: number;
  activeTasks: number;
  barriersRemoved: number;
  collectiveMood: string;
  topKeywords: string[];
}

