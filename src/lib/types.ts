// Database types based on the existing Firestore structure

export interface User {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  created_at?: Date;
  last_active?: Date;
}

export interface VideoEngagement {
  video_id: string;
  user_id: string;
  vote: 'approve' | 'disapprove' | 'none';
  view_count: number;
  last_viewed: Date;
}

export interface VideoStats {
  video_id: string;
  total_views: number;
  total_approvals: number;
  total_disapprovals: number;
  video_name?: string;
}

export interface VideoMetadata {
  video_id: string;
  video_name: string;
  category: string;
  age_group: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  doctor_id?: string;
  message: string;
  timestamp: Date;
  sender_type: 'user' | 'doctor';
  read: boolean;
}

export interface UserProfile {
  user_id: string;
  child_age_months?: number;
  child_name?: string;
  parent_name?: string;
  additional_info?: string;
}

export interface Notification {
  user_name: string;
  user_phone: string;
  disapprovals?: Array<{
    video_name: string;
    timestamp: Date;
    type: 'disapprove';
  }>;
}

export interface DashboardStats {
  totalUsers: number;
  totalVideos: number;
  totalViews: number;
  totalEngagements: number;
  activeUsersToday: number;
  averageVideoRating: number;
}

export interface UserAnalytics {
  user: User;
  profile?: UserProfile;
  videoEngagements: VideoEngagement[];
  totalWatchTime: number;
  favoriteCategories: string[];
  developmentProgress: {
    ageGroup: string;
    completedMilestones: number;
    totalMilestones: number;
    concerns: string[];
  };
}
