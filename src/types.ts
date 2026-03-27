export interface Expert {
  id: string;
  name: string;
  skills: string[];
  experience: number;
  rate: number;
  rating: number;
  bio: string;
}

export interface Project {
  title: string;
  budget: number;
  skills_required: string[];
  duration_days: number;
}

export interface MatchResult {
  expert: Expert;
  score: number;
}

export interface Message {
  room: string;
  author: string;
  message: string;
  time: string;
}
