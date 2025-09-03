import React, { useState } from 'react'
import { PageLayout } from './components/PageLayout'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { DataSources } from './components/DataSources'
import { Datasets } from './components/Datasets'
import { DataCleaning } from './components/DataCleaning'
import { DataMerging } from './components/DataMerging'
import { DataExport } from './components/DataExport'
import { useAppState } from './hooks/useAppState'
import ErrorBoundary from './components/ErrorBoundary'
import { handleError } from './utils/errorHandler'

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const { state, dispatch } = useAppState()

  const handleError = (error, errorInfo) => {
    console.error('Application error:', error, errorInfo)
    // In a production app, this would send the error to a logging service
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <ErrorBoundary onError={handleError}>
            <Dashboard state={state} />
          </ErrorBoundary>
        )
      case 'sources':
        return (
          <ErrorBoundary onError={handleError}>
            <DataSources state={state} dispatch={dispatch} />
          </ErrorBoundary>
        )
      case 'datasets':
        return (
          <ErrorBoundary onError={handleError}>
            <Datasets state={state} dispatch={dispatch} />
          </ErrorBoundary>
        )
      case 'cleaning':
        return (
          <ErrorBoundary onError={handleError}>
            <DataCleaning state={state} dispatch={dispatch} />
          </ErrorBoundary>
        )
      case 'merging':
        return (
          <ErrorBoundary onError={handleError}>
            <DataMerging state={state} dispatch={dispatch} />
          </ErrorBoundary>
        )
      case 'export':
        return (
          <ErrorBoundary onError={handleError}>
            <DataExport state={state} dispatch={dispatch} />
          </ErrorBoundary>
        )
      default:
        return (
          <ErrorBoundary onError={handleError}>
            <Dashboard state={state} />
          </ErrorBoundary>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
      <ErrorBoundary onError={handleError}>
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
      </ErrorBoundary>
    </div>
  )
}

export default App

