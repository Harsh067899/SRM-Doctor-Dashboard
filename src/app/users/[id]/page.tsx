'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Phone, 
  MessageSquare, 
  Baby,
  Activity,
  BarChart2,
  AlertTriangle
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { getUserAnalytics } from '@/lib/firestore';
import { UserAnalytics } from '@/lib/types';
import { formatDistanceToNow, format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const analytics = await getUserAnalytics(userId);
      if (analytics) {
        setUserAnalytics(analytics);
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError('Failed to load user analytics');
      console.error('Error loading user analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadUserAnalytics();
    }
  }, [userId, loadUserAnalytics]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
            <Activity size={48} className="animate-pulse text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !userAnalytics) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-danger-text text-lg mb-4">{error || 'User not found'}</div>
          <button onClick={() => router.back()} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { user, profile, videoEngagements, developmentProgress } = userAnalytics;
  const approvals = developmentProgress.completedMilestones;
  const disapprovals = developmentProgress.concerns.length;
  const totalVotes = approvals + disapprovals;
  const approvalRate = totalVotes > 0 ? (approvals / totalVotes) * 100 : 0;
  
  const engagementByMonth = videoEngagements.reduce((acc, v) => {
    const month = format(v.last_viewed, 'MMM yyyy');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const chartData = Object.entries(engagementByMonth).map(([name, engagements]) => ({ name, engagements }));

  return (
    <DashboardLayout>
      <div className="header">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="btn btn-secondary">
            <ArrowLeft size={16} />
            Back
          </button>
          <div>
            <h1>{user.name}</h1>
            <p>Patient Profile & Analytics</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Info & Profile */}
        <div className="lg:col-span-1 space-y-8">
          <div className="card">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mb-4">
                <UserIcon size={48} className="text-primary-text" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-secondary">{user.email || 'No email provided'}</p>
              <div className="flex gap-2 mt-4">
                <a href={`tel:${user.phone_number}`} className="btn btn-secondary btn-sm"><Phone size={14}/> Call</a>
                <Link href={`/messages?user=${user.id}`} className="btn btn-primary btn-sm"><MessageSquare size={14}/> Message</Link>
              </div>
            </div>
            <hr className="my-6 border-border-light" />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Last Active:</span>
                <span className="font-medium">{user.last_active ? formatDistanceToNow(user.last_active, { addSuffix: true }) : 'Never'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Joined:</span>
                <span className="font-medium">{user.created_at ? format(user.created_at, 'MMM dd, yyyy') : 'N/A'}</span>
              </div>
            </div>
          </div>

          {profile && (
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Baby size={20} className="text-primary"/>
                <h3 className="card-title">Child&apos;s Profile</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Name:</span>
                  <span className="font-medium">{profile.child_name || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Age:</span>
                  <span className="font-medium">{profile.child_age_months ? `${profile.child_age_months} months` : 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Parent:</span>
                  <span className="font-medium">{profile.parent_name || 'Not provided'}</span>
                </div>
                {profile.additional_info && (
                    <div>
                        <span className="text-secondary">Notes:</span>
                        <p className="font-medium mt-1">{profile.additional_info}</p>
                    </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Analytics */}
        <div className="lg:col-span-2 space-y-8">
            <div className="stats-grid">
                <div className="stat-card">
                    <p className="stat-label">Total Engagements</p>
                    <p className="stat-number">{videoEngagements.length}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Approval Rate</p>
                    <p className="stat-number">{Math.round(approvalRate)}%</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Concerns Logged</p>
                    <p className="stat-number">{disapprovals}</p>
                </div>
            </div>
          
            <div className="card">
                <div className="card-header flex items-center gap-2">
                    <BarChart2 size={20} className="text-primary"/>
                    <h3 className="card-title">Engagement Over Time</h3>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af"/>
                            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af"/>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card-light)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '0.5rem'
                                }}
                            />
                            <Bar dataKey="engagements" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {disapprovals > 0 &&
                <div className="card border-l-4 border-danger">
                    <div className="card-header flex items-center gap-2">
                        <AlertTriangle size={20} className="text-danger"/>
                        <h3 className="card-title text-danger-text">Areas of Concern</h3>
                    </div>
                    <div className="space-y-2">
                        {developmentProgress.concerns.slice(0,5).map((videoId, index) => (
                            <div key={index} className="flex justify-between items-center p-2 rounded-md bg-danger-light">
                                <span className="text-sm font-medium">{videoId}</span>
                                <span className="badge badge-error">Needs Review</span>
                            </div>
                        ))}
                    </div>
                </div>
            }

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Engagement History</h3>
              <p className="card-description">History of video interactions and feedback.</p>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Video ID</th>
                    <th>Feedback</th>
                    <th>Last Viewed</th>
                  </tr>
                </thead>
                <tbody>
                  {videoEngagements.slice(0, 10).map((engagement, index) => (
                    <tr key={index}>
                      <td>
                        <code className="text-sm">{engagement.video_id}</code>
                      </td>
                      <td>
                        {engagement.vote === 'approve' && <span className="badge badge-success">Approved</span>}
                        {engagement.vote === 'disapprove' && <span className="badge badge-error">Concern</span>}
                        {engagement.vote === 'none' && <span className="badge badge-info">Viewed</span>}
                      </td>
                      <td>
                        <p className="text-sm">{format(engagement.last_viewed, 'MMM dd, yyyy')}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
