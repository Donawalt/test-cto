import React from 'react'
import type { Users } from '@myapp/types'
import { UserCard } from './UserCard'

interface UsersListProps {
  users: Users[]
  onUserClick?: (user: Users) => void
  emptyMessage?: string
}

export function UsersList({ users, onUserClick, emptyMessage = "No users found" }: UsersListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onClick={() => onUserClick?.(user)}
        />
      ))}
    </div>
  )
}