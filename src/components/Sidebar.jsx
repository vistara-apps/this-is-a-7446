import React from 'react'
import { 
  LayoutDashboard, 
  Database, 
  FolderOpen, 
  Wrench, 
  Merge,
  Crown,
  Settings,
  User
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sources', label: 'Data Sources', icon: Database },
  { id: 'datasets', label: 'Datasets', icon: FolderOpen },
  { id: 'cleaning', label: 'Data Cleaning', icon: Wrench },
  { id: 'merging', label: 'Data Merging', icon: Merge },
]

export function Sidebar({ activeView, onViewChange, userTier }) {
  return (
    <div className="w-64 glass-effect border-r border-white/20 p-6">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold mb-1">DataMosaic</h1>
        <p className="text-white/70 text-sm">Data collection & processing</p>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 text-white/80 mb-2">
          <User className="w-4 h-4" />
          <span className="text-sm">demo@datamosaic.com</span>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400 capitalize">{userTier} Plan</span>
        </div>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all ${
              activeView === item.id
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="mt-auto pt-6">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-all">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  )
}