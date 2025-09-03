import React, { useState } from 'react'
import { PageLayout } from './components/PageLayout'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { DataSources } from './components/DataSources'
import { Datasets } from './components/Datasets'
import { DataCleaning } from './components/DataCleaning'
import { DataMerging } from './components/DataMerging'
import { useAppState } from './hooks/useAppState'

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const { state, dispatch } = useAppState()

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard state={state} />
      case 'sources':
        return <DataSources state={state} dispatch={dispatch} />
      case 'datasets':
        return <Datasets state={state} dispatch={dispatch} />
      case 'cleaning':
        return <DataCleaning state={state} dispatch={dispatch} />
      case 'merging':
        return <DataMerging state={state} dispatch={dispatch} />
      default:
        return <Dashboard state={state} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
      <PageLayout>
        <div className="flex h-screen">
          <Sidebar 
            activeView={activeView} 
            onViewChange={setActiveView}
            userTier={state.user.subscriptionTier}
          />
          <main className="flex-1 overflow-auto">
            {renderActiveView()}
          </main>
        </div>
      </PageLayout>
    </div>
  )
}

export default App