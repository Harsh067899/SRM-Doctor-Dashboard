'use client';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  User, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Eye,
  Clock
} from 'lucide-react';
import { getAllUsers, getVideoEngagements, getVideoName } from '@/lib/firestore';
import { User as UserType } from '@/lib/types';

interface ActivityItem {
  id: string;
  type: 'user_registration' | 'video_view' | 'video_approval' | 'video_disapproval' | 'message_sent';
  user: string;
  description: string;
  timestamp: Date;
  videoId?: string;
}

function getActivityIcon(type: ActivityItem['type']) {
  switch (type) {
    case 'user_registration':
      return <User size={16} className="text-blue-600" />;
    case 'video_view':
      return <Eye size={16} className="text-gray-600" />;
    case 'video_approval':
      return <ThumbsUp size={16} className="text-green-600" />;
    case 'video_disapproval':
      return <ThumbsDown size={16} className="text-red-600" />;
    case 'message_sent':
      return <MessageSquare size={16} className="text-purple-600" />;
    default:
      return <Clock size={16} className="text-gray-600" />;
  }
}

function getActivityColor(type: ActivityItem['type']) {
  switch (type) {
    case 'user_registration':
      return 'bg-blue-50 border-blue-200';
    case 'video_view':
      return 'bg-gray-50 border-gray-200';
    case 'video_approval':
      return 'bg-green-50 border-green-200';
    case 'video_disapproval':
      return 'bg-red-50 border-red-200';
    case 'message_sent':
      return 'bg-purple-50 border-purple-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentActivity = async () => {
      try {
        const [users, engagements] = await Promise.all([
          getAllUsers(),
          getVideoEngagements()
        ]);

        // Create a map of users for quick lookup
        const userMap = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as Record<string, UserType>);

        const activityItems: ActivityItem[] = [];

        // Add user registrations (recent users)
        const recentUsers = users
          .filter(user => user.created_at && user.created_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
          .sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0))
          .slice(0, 3);

        recentUsers.forEach(user => {
          if (user.created_at) {
            activityItems.push({
              id: `user-${user.id}`,
              type: 'user_registration',
              user: user.name,
              description: 'New user registered',
              timestamp: user.created_at
            });
          }
        });

        // Add video engagements (recent views, approvals, disapprovals)
        const recentEngagements = engagements
          .filter(eng => eng.last_viewed > new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
          .sort((a, b) => b.last_viewed.getTime() - a.last_viewed.getTime())
          .slice(0, 10);

        recentEngagements.forEach(engagement => {
          const user = userMap[engagement.user_id];
          const videoName = getVideoName(engagement.video_id);
          
          if (user) {
            // Add view activity
            activityItems.push({
              id: `view-${engagement.video_id}-${engagement.user_id}`,
              type: 'video_view',
              user: user.name,
              description: `Viewed "${videoName}"`,
              timestamp: engagement.last_viewed,
              videoId: engagement.video_id
            });

            // Add approval/disapproval activity if voted
            if (engagement.vote === 'approve') {
              activityItems.push({
                id: `approve-${engagement.video_id}-${engagement.user_id}`,
                type: 'video_approval',
                user: user.name,
                description: `Approved "${videoName}"`,
                timestamp: engagement.last_viewed,
                videoId: engagement.video_id
              });
            } else if (engagement.vote === 'disapprove') {
              activityItems.push({
                id: `disapprove-${engagement.video_id}-${engagement.user_id}`,
                type: 'video_disapproval',
                user: user.name,
                description: `Marked concerns for "${videoName}"`,
                timestamp: engagement.last_viewed,
                videoId: engagement.video_id
              });
            }
          }
        });

        // Sort all activities by timestamp and take the most recent 8
        const sortedActivities = activityItems
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 8);

        setActivities(sortedActivities);
      } catch (error) {
        console.error('Error loading recent activity:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentActivity();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          className="flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-secondary-light"
        >
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">
              <span className="font-medium">{activity.user}</span> {activity.description}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
      
      <div className="text-center pt-4">
        <button className="btn btn-secondary btn-sm">
          View All Activity
        </button>
      </div>
    </div>
  );
}
