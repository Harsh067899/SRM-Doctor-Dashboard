'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, ThumbsUp, ThumbsDown, Video } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import VideoPerformanceChart from '@/components/VideoPerformanceChart';
import { getVideoEngagementSummary, getAllVideoStats, getAllUsers, getVideoName, getVideoCategory, getDevelopmentalCategory } from '@/lib/firestore';

interface VideoPerformanceData {
  videoId: string;
  views: number;
  approvals: number;
  disapprovals: number;
  engagementRate: number;
}

interface TopPerformingVideo {
  videoId: string;
  videoName: string;
  category: string;
  shortId: string;
  views: number;
  approvals: number;
  disapprovals: number;
  engagementRate: number;
  uniqueViewers: number;
}

interface UserEngagementTrend {
  date: string;
  newUsers: number;
  activeUsers: number;
  engagements: number;
}

interface AnalyticsData {
  totalVideos: number;
  totalViews: number;
  totalUsers: number;
  totalApprovals: number;
  totalConcerns: number;
  averageEngagementRate: number;
  topPerformingVideos: TopPerformingVideo[];
  userEngagementTrends: UserEngagementTrend[];
  videoPerformanceData: VideoPerformanceData[];
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      const [videoSummary, videoStats, users] = await Promise.all([
        getVideoEngagementSummary(),
        getAllVideoStats(),
        getAllUsers()
      ]);

      // Calculate analytics metrics
      const totalVideos = videoStats.length;
      const totalUsers = users.length;
      const totalViews = videoSummary.reduce((sum, v) => sum + v.totalViews, 0);
      const totalApprovals = videoSummary.reduce((sum, v) => sum + v.approvals, 0);
      const totalConcerns = videoSummary.reduce((sum, v) => sum + v.disapprovals, 0);
      const averageEngagementRate = videoSummary.length > 0 
        ? videoSummary.reduce((sum, v) => sum + v.engagementRate, 0) / videoSummary.length 
        : 0;

      // Top performing videos
      const topPerformingVideos = videoSummary
        .sort((a, b) => b.engagementRate - a.engagementRate)
        .slice(0, 10)
        .map(video => ({
          videoId: video.videoId,
          videoName: getVideoName(video.videoId),
          category: getVideoCategory(getVideoName(video.videoId)),
          shortId: video.videoId.slice(0, 8),
          views: video.totalViews,
          approvals: video.approvals,
          disapprovals: video.disapprovals,
          engagementRate: video.engagementRate,
          uniqueViewers: video.uniqueViewers
        }));

      // Video performance data for charts
      const videoPerformanceData = videoSummary.map(video => ({
        videoId: video.videoId,
        views: video.totalViews,
        approvals: video.approvals,
        disapprovals: video.disapprovals,
        engagementRate: video.engagementRate
      }));

      // Mock user engagement trends (you can enhance this with real time-based data)
      const userEngagementTrends = [
        { date: '2024-01-01', newUsers: 12, activeUsers: 45, engagements: 234 },
        { date: '2024-01-02', newUsers: 8, activeUsers: 52, engagements: 276 },
        { date: '2024-01-03', newUsers: 15, activeUsers: 48, engagements: 198 },
        { date: '2024-01-04', newUsers: 6, activeUsers: 61, engagements: 312 },
        { date: '2024-01-05', newUsers: 18, activeUsers: 55, engagements: 287 },
      ];

      setAnalyticsData({
        totalVideos,
        totalViews,
        totalUsers,
        totalApprovals,
        totalConcerns,
        averageEngagementRate,
        topPerformingVideos,
        userEngagementTrends,
        videoPerformanceData
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analyticsData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-600 text-lg">Failed to load analytics data</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="header">
        <div className="flex justify-between items-center">
          <div>
            <h1>Advanced Analytics</h1>
            <p>Comprehensive insights into video performance and user engagement</p>
          </div>
          <div className="flex gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Content</p>
              <p className="stat-number">{analyticsData.totalVideos}</p>
              <p className="stat-change positive">Development videos</p>
            </div>
            <Video className="text-purple-600" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Views</p>
              <p className="stat-number">{analyticsData.totalViews.toLocaleString()}</p>
              <p className="stat-change positive">Across all content</p>
            </div>
            <Eye className="text-blue-600" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Active Users</p>
              <p className="stat-number">{analyticsData.totalUsers}</p>
              <p className="stat-change positive">Registered parents</p>
            </div>
            <Users className="text-green-600" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Avg. Engagement</p>
              <p className="stat-number">{Math.round(analyticsData.averageEngagementRate)}%</p>
              <p className="stat-change positive">User interaction rate</p>
            </div>
            <TrendingUp className="text-orange-600" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Milestones Achieved</p>
              <p className="stat-number">{analyticsData.totalApprovals}</p>
              <p className="stat-change positive">Parent confirmations</p>
            </div>
            <ThumbsUp className="text-green-600" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Areas of Concern</p>
              <p className="stat-number">{analyticsData.totalConcerns}</p>
              <p className="stat-change negative">Requires attention</p>
            </div>
            <ThumbsDown className="text-red-600" />
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="mb-8">
        <VideoPerformanceChart data={analyticsData.videoPerformanceData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Performing Videos */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Performing Videos</h3>
            <p className="card-description">Highest engagement rates and user interaction</p>
          </div>
          
          <div className="space-y-3">
            {analyticsData.topPerformingVideos.slice(0, 8).map((video, index) => (
              <div key={video.videoId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{video.videoName}</p>
                    <p className="text-sm text-gray-600">{video.uniqueViewers} unique viewers • {getVideoCategory(video.videoId)} • {getDevelopmentalCategory(video.videoName)}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye size={14} className="text-blue-500" />
                      <span>{video.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={14} className="text-green-500" />
                      <span>{video.approvals}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown size={14} className="text-red-500" />
                      <span>{video.disapprovals}</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-purple-600 mt-1">
                    {Math.round(video.engagementRate)}% engagement
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Insights */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Engagement Insights</h3>
            <p className="card-description">Key patterns and recommendations</p>
          </div>
          
          <div className="space-y-6">
            {/* Success Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Success Rate</span>
                <span className="text-sm text-gray-600">
                  {Math.round((analyticsData.totalApprovals / (analyticsData.totalApprovals + analyticsData.totalConcerns)) * 100)}%
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-green-500" 
                  style={{ 
                    width: `${(analyticsData.totalApprovals / (analyticsData.totalApprovals + analyticsData.totalConcerns)) * 100}%` 
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Parents confirming milestone achievement vs. expressing concerns
              </p>
            </div>

            {/* Content Effectiveness */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Content Effectiveness</h4>
              <p className="text-sm text-blue-800">
                Videos with higher engagement rates (&gt;50%) show better milestone tracking success. 
                Consider promoting these patterns across all content.
              </p>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Recommendations</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Focus on videos with high approval rates for best practices</li>
                <li>• Review content with high concern rates for improvements</li>
                <li>• Encourage parent engagement through targeted messaging</li>
              </ul>
            </div>

            {/* Areas of Concern */}
            {analyticsData.totalConcerns > 0 && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Areas Requiring Attention</h4>
                <p className="text-sm text-red-800">
                  {analyticsData.totalConcerns} parents have flagged developmental concerns. 
                  Consider reaching out for personalized guidance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Complete Video Performance</h3>
          <p className="card-description">Detailed metrics for all videos in the platform</p>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Video Name</th>
                <th>Total Views</th>
                <th>Unique Viewers</th>
                <th>Approvals</th>
                <th>Concerns</th>
                <th>Engagement Rate</th>
                <th>Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topPerformingVideos.map((video) => {
                const successRate = video.approvals + video.disapprovals > 0 
                  ? (video.approvals / (video.approvals + video.disapprovals)) * 100 
                  : 0;
                
                return (
                  <tr key={video.videoId}>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{video.videoName}</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {video.shortId}...
                        </code>
                      </div>
                    </td>
                    <td>{video.views}</td>
                    <td>{video.uniqueViewers}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={14} className="text-green-600" />
                        {video.approvals}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <ThumbsDown size={14} className="text-red-600" />
                        {video.disapprovals}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${video.engagementRate >= 50 ? 'badge-success' : video.engagementRate >= 25 ? 'badge-warning' : 'badge-error'}`}>
                        {Math.round(video.engagementRate)}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${successRate >= 70 ? 'badge-success' : successRate >= 40 ? 'badge-warning' : 'badge-error'}`}>
                        {Math.round(successRate)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
