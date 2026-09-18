export type ProjectStatus = 'briefing' | 'concept' | 'production' | 'review' | 'completed' | 'on_hold';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Project = {
  id: string;
  title: string;
  client: string;
  category: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  description: string;
  start_date: string | null;
  deadline: string | null;
  completed_at: string | null;
  progress: number;
  team: string[];
  budget: number | null;
  tags: string[];
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectUpdate = {
  id: string;
  project_id: string;
  message: string;
  author: string;
  old_status: ProjectStatus | null;
  new_status: ProjectStatus | null;
  progress: number | null;
  created_at: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string | null;
  avatar_url: string | null;
};
