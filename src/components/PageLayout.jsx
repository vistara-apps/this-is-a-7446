import React from 'react'

export function PageLayout({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-6 h-full">
      {children}
    </div>
  )
}