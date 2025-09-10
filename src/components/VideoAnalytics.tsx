'use client';
import { VideoStats } from '@/lib/types';
import { Eye, ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react';
import { getVideoName, getVideoCategory, getDevelopmentalCategory } from '@/lib/firestore';

interface VideoAnalyticsProps {
  videoStats: VideoStats[];
}

export default function VideoAnalytics({ videoStats }: VideoAnalyticsProps) {
  if (videoStats.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No video data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {videoStats.map((video) => {
        const totalVotes = video.total_approvals + video.total_disapprovals;
        const approvalRate = totalVotes > 0 ? (video.total_approvals / totalVotes) * 100 : 0;
        const videoName = video.video_name || getVideoName(video.video_id);
        
        return (
          <div key={video.video_id} className="p-3 -mx-3 rounded-lg hover:bg-secondary-light">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{videoName}</h4>
                <p className="text-xs text-gray-500">
                  {getVideoCategory(video.video_id)} • {getDevelopmentalCategory(videoName)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-success font-medium">
                <TrendingUp size={14} />
                {Math.round(approvalRate)}%
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <div className="flex items-center gap-1 text-secondary">
                <Eye size={12} />
                <span>{video.total_views} views</span>
              </div>
              <div className="flex items-center gap-1 text-success-text">
                <ThumbsUp size={12} />
                <span>{video.total_approvals} approvals</span>
              </div>
              <div className="flex items-center gap-1 text-danger-text">
                <ThumbsDown size={12} />
                <span>{video.total_disapprovals} concerns</span>
              </div>
            </div>
            
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${approvalRate}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
