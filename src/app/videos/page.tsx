'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, ThumbsUp, ThumbsDown, TrendingUp, Users, Play, BarChart3, User } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { getAllVideoStats, getVideoEngagements, getAllUsers, getVideoName, getVideoCategory, getDevelopmentalCategory } from '@/lib/firestore';
import { VideoStats, VideoEngagement, User as UserType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface VideoWithEngagements extends VideoStats {
  engagements: VideoEngagement[];
  uniqueViewers: number;
  averageViewsPerUser: number;
  engagementRate: number;
}

export default function VideoAnalyticsPage() {
  const [videos, setVideos] = useState<VideoWithEngagements[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithEngagements | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'views' | 'approvals' | 'engagement'>('views');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideoAnalytics();
  }, []);

  const loadVideoAnalytics = async () => {
    try {
      const [videoStats, allUsers] = await Promise.all([
        getAllVideoStats(),
        getAllUsers()
      ]);
      
      setUsers(allUsers);

      // Get detailed engagements for each video
      const videosWithEngagements = await Promise.all(
        videoStats.map(async (video) => {
          const engagements = await getVideoEngagements(video.video_id);
          const uniqueViewers = new Set(engagements.map(e => e.user_id)).size;
          const totalViews = engagements.reduce((sum, e) => sum + e.view_count, 0);
          const averageViewsPerUser = uniqueViewers > 0 ? totalViews / uniqueViewers : 0;
          const engagementRate = video.total_views > 0 ? 
            ((video.total_approvals + video.total_disapprovals) / video.total_views) * 100 : 0;

          return {
            ...video,
            engagements,
            uniqueViewers,
            averageViewsPerUser,
            engagementRate
          };
        })
      );

      setVideos(videosWithEngagements);
    } catch (error) {
      console.error('Error loading video analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedVideos = videos
    .filter(video => video.video_id.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.total_views - a.total_views;
        case 'approvals':
          return b.total_approvals - a.total_approvals;
        case 'engagement':
          return b.engagementRate - a.engagementRate;
        default:
          return 0;
      }
    });

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getUserPhone = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.phone_number : 'N/A';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Loading video analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="header">
        <div className="flex justify-between items-center">
          <div>
            <h1>Video Analytics</h1>
            <p>Comprehensive analysis of video performance and user engagement</p>
          </div>
          <div className="text-lg font-semibold text-blue-600">
            {videos.length} Videos Tracked
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Views</p>
              <p className="stat-number">{videos.reduce((sum, v) => sum + v.total_views, 0)}</p>
            </div>
            <Eye className="text-blue-600" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Approvals</p>
              <p className="stat-number">{videos.reduce((sum, v) => sum + v.total_approvals, 0)}</p>
            </div>
            <ThumbsUp className="text-green-600" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Concerns</p>
              <p className="stat-number">{videos.reduce((sum, v) => sum + v.total_disapprovals, 0)}</p>
            </div>
            <ThumbsDown className="text-red-600" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Avg. Engagement</p>
              <p className="stat-number">
                {Math.round(videos.reduce((sum, v) => sum + v.engagementRate, 0) / videos.length || 0)}%
              </p>
            </div>
            <TrendingUp className="text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video List */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Videos</h3>
              <p className="card-description">Select a video to view detailed analytics</p>
            </div>
            
            {/* Search and Sort */}
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'views' | 'approvals' | 'engagement')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="views">Sort by Views</option>
                <option value="approvals">Sort by Approvals</option>
                <option value="engagement">Sort by Engagement</option>
              </select>
            </div>

            {/* Video List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAndSortedVideos.map((video) => (
                <div
                  key={video.video_id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedVideo?.video_id === video.video_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Play size={16} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {video.video_name || getVideoName(video.video_id)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {video.uniqueViewers} unique viewers • {getVideoCategory(video.video_id)} • {getDevelopmentalCategory(video.video_name || getVideoName(video.video_id))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Eye size={12} className="text-blue-500" />
                      <span>{video.total_views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={12} className="text-green-500" />
                      <span>{video.total_approvals}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown size={12} className="text-red-500" />
                      <span>{video.total_disapprovals}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${video.total_approvals + video.total_disapprovals > 0 ? 
                            (video.total_approvals / (video.total_approvals + video.total_disapprovals)) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="lg:col-span-2">
          {selectedVideo ? (
            <div className="space-y-6">
              {/* Video Overview */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{selectedVideo.video_name || getVideoName(selectedVideo.video_id)}</h3>
                  <p className="card-description">
                    Age Group: {getVideoCategory(selectedVideo.video_id)} • 
                    Category: {getDevelopmentalCategory(selectedVideo.video_name || getVideoName(selectedVideo.video_id))} • 
                    ID: {selectedVideo.video_id}
                  </p>
                </div>
                
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="stat-label">Total Views</p>
                        <p className="stat-number">{selectedVideo.total_views}</p>
                      </div>
                      <Eye className="text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="stat-label">Unique Viewers</p>
                        <p className="stat-number">{selectedVideo.uniqueViewers}</p>
                      </div>
                      <Users className="text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="stat-label">Engagement Rate</p>
                        <p className="stat-number">{Math.round(selectedVideo.engagementRate)}%</p>
                      </div>
                      <BarChart3 className="text-green-600" />
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="stat-label">Avg. Views/User</p>
                        <p className="stat-number">{Math.round(selectedVideo.averageViewsPerUser * 10) / 10}</p>
                      </div>
                      <TrendingUp className="text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Breakdown */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">User Engagement Details</h3>
                  <p className="card-description">Individual user interactions with this video</p>
                </div>
                
                {selectedVideo.engagements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No engagement data available for this video
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Contact</th>
                          <th>Views</th>
                          <th>Feedback</th>
                          <th>Last Viewed</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVideo.engagements.map((engagement, index) => (
                          <tr key={index}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User size={14} className="text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {getUserName(engagement.user_id)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ID: {engagement.user_id.slice(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </td>
                            
                            <td>
                              <div className="text-sm text-gray-600">
                                {getUserPhone(engagement.user_id)}
                              </div>
                            </td>
                            
                            <td>
                              <div className="flex items-center gap-1">
                                <Eye size={14} className="text-blue-500" />
                                <span className="font-medium">{engagement.view_count}</span>
                              </div>
                            </td>
                            
                            <td>
                              {engagement.vote === 'approve' && (
                                <div className="flex items-center gap-1">
                                  <ThumbsUp size={14} className="text-green-600" />
                                  <span className="badge badge-success">Approved</span>
                                </div>
                              )}
                              {engagement.vote === 'disapprove' && (
                                <div className="flex items-center gap-1">
                                  <ThumbsDown size={14} className="text-red-600" />
                                  <span className="badge badge-error">Concern</span>
                                </div>
                              )}
                              {engagement.vote === 'none' && (
                                <span className="badge badge-info">No Feedback</span>
                              )}
                            </td>
                            
                            <td>
                              <div className="text-sm text-gray-600">
                                {formatDistanceToNow(engagement.last_viewed, { addSuffix: true })}
                              </div>
                            </td>
                            
                            <td>
                              <span className={`badge ${
                                engagement.vote === 'approve' ? 'badge-success' : 
                                engagement.vote === 'disapprove' ? 'badge-error' : 
                                'badge-warning'
                              }`}>
                                {engagement.vote === 'approve' ? 'Milestone Achieved' :
                                 engagement.vote === 'disapprove' ? 'Needs Attention' :
                                 'In Progress'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Feedback Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Approval Analysis</h3>
                    <p className="card-description">Parents who marked milestones as achieved</p>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedVideo.engagements
                      .filter(e => e.vote === 'approve')
                      .slice(0, 5)
                      .map((engagement, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <ThumbsUp size={16} className="text-green-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {getUserName(engagement.user_id)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {engagement.view_count} views
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDistanceToNow(engagement.last_viewed, { addSuffix: true })}
                          </div>
                        </div>
                      ))}
                    
                    {selectedVideo.engagements.filter(e => e.vote === 'approve').length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No approvals yet
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Concern Analysis</h3>
                    <p className="card-description">Parents who marked developmental concerns</p>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedVideo.engagements
                      .filter(e => e.vote === 'disapprove')
                      .slice(0, 5)
                      .map((engagement, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <ThumbsDown size={16} className="text-red-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {getUserName(engagement.user_id)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {engagement.view_count} views
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDistanceToNow(engagement.last_viewed, { addSuffix: true })}
                          </div>
                        </div>
                      ))}
                    
                    {selectedVideo.engagements.filter(e => e.vote === 'disapprove').length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No concerns reported
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <BarChart3 size={48} className="mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a Video</h3>
                <p className="text-center">Choose a video from the list to view detailed analytics and user engagement data</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
