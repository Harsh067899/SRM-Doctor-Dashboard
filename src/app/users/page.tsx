'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Eye, MessageSquare, User as UserIcon } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { getAllUsers, getUserEngagements } from '@/lib/firestore';
import { User as UserType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface UserWithStats extends UserType {
  totalEngagements: number;
  approvalRate: number;
  lastVideoWatched: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'activity' | 'engagements'>('name');
  const [loading, setLoading] = useState(true);

  const filterAndSortUsers = useCallback(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number.includes(searchTerm) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'activity':
          return (b.last_active?.getTime() || 0) - (a.last_active?.getTime() || 0);
        case 'engagements':
          return b.totalEngagements - a.totalEngagements;
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, sortBy]);

  useEffect(() => {
    loadUsersWithStats();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, sortBy, filterAndSortUsers]);

  const loadUsersWithStats = async () => {
    try {
      const allUsers = await getAllUsers();
      
      // Get engagement stats for each user
      const usersWithStats = await Promise.all(
        allUsers.map(async (user) => {
          const engagements = await getUserEngagements(user.id);
          const approvals = engagements.filter(e => e.vote === 'approve').length;
          const disapprovals = engagements.filter(e => e.vote === 'disapprove').length;
          const totalVotes = approvals + disapprovals;
          
          return {
            ...user,
            totalEngagements: engagements.length,
            approvalRate: totalVotes > 0 ? (approvals / totalVotes) * 100 : 0,
            lastVideoWatched: engagements.length > 0 ? engagements[0].video_id : 'None'
          };
        })
      );
      
      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Loading users...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="header">
        <h1>Users Management</h1>
        <p>A list of all registered parents using the application.</p>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'activity' | 'engagements')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="name">Sort by Name</option>
              <option value="activity">Sort by Last Active</option>
              <option value="engagements">Sort by Engagements</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Last Active</th>
              <th>Engagements</th>
              <th>Approval Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                      <UserIcon size={20} className="text-primary-text" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.phone_number}</p>
                    </div>
                  </div>
                </td>
                <td>
                  {user.last_active ? (
                    <p className="text-sm text-gray-600">
                      {formatDistanceToNow(user.last_active, { addSuffix: true })}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">Never</p>
                  )}
                </td>
                <td>
                  <span className="badge badge-info">{user.totalEngagements}</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${user.approvalRate >= 70 ? 'text-success' : user.approvalRate >= 40 ? 'text-warning' : 'text-danger'}`}>
                      {Math.round(user.approvalRate)}%
                    </span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div className={`h-2 rounded-full ${user.approvalRate >= 70 ? 'bg-success' : user.approvalRate >= 40 ? 'bg-warning' : 'bg-danger'}`} style={{width: `${user.approvalRate}%`}}></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Link href={`/users/${user.id}`} className="btn btn-sm btn-secondary">
                      <Eye size={14} />
                    </Link>
                    <Link href={`/messages?user=${user.id}`} className="btn btn-sm btn-secondary">
                      <MessageSquare size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
