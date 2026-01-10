import React from 'react'
import type { Users } from '@myapp/types'

interface UserCardProps {
  user: Users
  onClick?: () => void
}

export function UserCard({ user, onClick }: UserCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {user.name}
          </h2>
          <p className="text-sm text-gray-600 truncate">
            {user.email}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.role === 'admin' 
            ? 'bg-purple-100 text-purple-800'
            : user.role === 'moderator'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {user.role}
        </span>
        
        <span className="text-xs text-gray-500">
          {user.created_at.toLocaleDateString()}
        </span>
      </div>

      {user.bio && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
          {user.bio}
        </p>
      )}
    </div>
  )
}