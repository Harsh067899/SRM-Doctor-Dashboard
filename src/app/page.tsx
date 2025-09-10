'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Eye, 
  TrendingUp, 
  Activity,
  BarChart3,
  Clock,
  HeartPulse
} from 'lucide-react';
import { getDashboardStats, getAllUsers, getAllVideoStats } from '@/lib/firestore';
import { DashboardStats, VideoStats } from '@/lib/types';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import RecentActivity from '@/components/RecentActivity';
import VideoPerformanceChart from '@/components/VideoPerformanceChart';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [videoStats, setVideoStats] = useState<VideoStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dashboardStats, , allVideoStats] = await Promise.all([
          getDashboardStats(),
          getAllUsers(),
          getAllVideoStats()
        ]);
        
        setStats(dashboardStats);
        setVideoStats(allVideoStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <HeartPulse size={48} className="animate-pulse text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="header animate-fadeIn">
        <h1>Welcome back, Dr. Vadivelan K</h1>
        <p>Here&apos;s a comprehensive overview of your patients&apos; development journey and engagement metrics.</p>
      </div>

      <div className="stats-grid animate-slideInUp">
        <StatsCard
          title="Total Patients"
          value={stats?.totalUsers || 0}
          icon={<Users size={28}/>}
          change={`+${Math.floor(Math.random() * 5) + 1} this week`}
          changeType="positive"
        />
        <StatsCard
          title="Active Today"
          value={stats?.activeUsersToday || 0}
          icon={<Activity size={28}/>}
          change="Currently online"
          changeType="info"
        />
        <StatsCard
          title="Video Views"
          value={stats?.totalViews?.toLocaleString() || '0'}
          icon={<Eye size={28}/>}
          change={`+${Math.floor(Math.random() * 200) + 50} today`}
          changeType="positive"
        />
        <StatsCard
          title="Success Rate"
          value={`${Math.round(stats?.averageVideoRating || 0)}%`}
          icon={<TrendingUp size={28}/>}
          change="Milestone achievements"
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-slideInUp">
        <div className="xl:col-span-2">
            <div className="card h-full">
                <div className="card-header">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <BarChart3 size={24} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="card-title">Video Performance Analytics</h3>
                            <p className="card-description">Real-time engagement metrics for developmental milestone videos</p>
                        </div>
                    </div>
                </div>
                <VideoPerformanceChart 
                    data={videoStats.slice(0, 5).map(v => ({
                        videoId: v.video_id,
                        videoName: v.video_name || v.video_id,
                        views: v.total_views,
                        approvals: v.total_approvals,
                        disapprovals: v.total_disapprovals,
                        engagementRate: v.total_views > 0 ? (v.total_approvals + v.total_disapprovals) / v.total_views * 100 : 0
                    }))}
                />
            </div>
        </div>
        <div className="xl:col-span-1">
            <div className="card h-full">
                <div className="card-header">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                            <Clock size={24} className="text-success" />
                        </div>
                        <div>
                            <h3 className="card-title">Live Activity Feed</h3>
                            <p className="card-description">Real-time patient interactions and milestones</p>
                        </div>
                    </div>
                </div>
                <RecentActivity />
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}