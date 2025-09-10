'use client';
import { User } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { User as UserIcon } from 'lucide-react';
import Link from 'next/link';

interface UsersListProps {
  users: User[];
}

export default function UsersList({ users }: UsersListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No users found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <Link key={user.id} href={`/users/${user.id}`}>
          <div className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-secondary-light transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                <UserIcon size={20} className="text-primary-text" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{user.name}</h4>
                <p className="text-xs text-gray-500">{user.phone_number}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                {user.last_active 
                  ? formatDistanceToNow(user.last_active, { addSuffix: true })
                  : 'Never active'
                }
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
