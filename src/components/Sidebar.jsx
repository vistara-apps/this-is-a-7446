import React from 'react'
import { 
  LayoutDashboard, 
  Database, 
  FolderOpen, 
  Wrench, 
  Merge,
  Crown,
  Settings,
  User,
  Download,
  HelpCircle,
  LogOut
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sources', label: 'Data Sources', icon: Database },
  { id: 'datasets', label: 'Datasets', icon: FolderOpen },
  { id: 'cleaning', label: 'Data Cleaning', icon: Wrench },
  { id: 'merging', label: 'Data Merging', icon: Merge },
  { id: 'export', label: 'Data Export', icon: Download },
]

// Define which features are available in each subscription tier
const tierFeatures = {
  free: ['dashboard', 'sources', 'datasets'],
  pro: ['dashboard', 'sources', 'datasets', 'cleaning', 'merging'],
  business: ['dashboard', 'sources', 'datasets', 'cleaning', 'merging', 'export']
}

export function Sidebar({ activeView, onViewChange, userTier }) {
  // Determine which menu items to show based on user tier
  const availableFeatures = tierFeatures[userTier] || tierFeatures.free;
  
  // Filter menu items based on available features
  const filteredMenuItems = menuItems.filter(item => 
    availableFeatures.includes(item.id)
  );
  
  // For items not available in current tier, we'll show them as locked
  const lockedItems = menuItems.filter(item => 
    !availableFeatures.includes(item.id)
  );

  return (
    <div className="w-64 glass-effect border-r border-white/20 p-6 flex flex-col h-full">
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
      
      <nav className="space-y-2 flex-1">
        {filteredMenuItems.map((item) => (
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
        
        {/* Locked features */}
        {lockedItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-white/50 text-xs uppercase mb-2 px-3">Upgrade to Access</div>
            {lockedItems.map((item) => (
              <div
                key={item.id}
                className="w-full flex items-center gap-3 px-3 py-2 text-white/40 cursor-not-allowed"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                <Crown className="w-4 h-4 ml-auto text-yellow-400/70" />
              </div>
            ))}
          </div>
        )}
      </nav>
      
      <div className="pt-6 space-y-2 border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-all">
          <HelpCircle className="w-5 h-5" />
          <span>Help & Support</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-all">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-all">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

