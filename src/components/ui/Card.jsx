import React from 'react'

export function Card({ children, variant = 'default', className = '', ...props }) {
  const baseClasses = 'rounded-lg shadow-card'
  
  const variantClasses = {
    default: 'bg-surface border border-gray-200',
    interactive: 'bg-surface border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer'
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}