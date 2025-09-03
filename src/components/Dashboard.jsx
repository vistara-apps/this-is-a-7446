import React from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { 
  Database, 
  FolderOpen, 
  Activity, 
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'

export function Dashboard({ state }) {
  const stats = {
    dataSources: state.dataSources.length,
    datasets: state.datasets.length,
    totalRows: state.datasets.reduce((sum, dataset) => sum + (dataset.rowCount || 0), 0),
    activeJobs: state.scrapeJobs.filter(job => job.status === 'running').length
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/70">Monitor your data collection and processing activities</p>
        </div>
        <Button variant="primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium mb-1">Data Sources</p>
              <p className="text-2xl font-bold text-text-primary">{stats.dataSources}</p>
            </div>
            <Database className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium mb-1">Datasets</p>
              <p className="text-2xl font-bold text-text-primary">{stats.datasets}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-accent" />
          </div>
        </Card>

        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium mb-1">Total Rows</p>
              <p className="text-2xl font-bold text-text-primary">{stats.totalRows.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium mb-1">Active Jobs</p>
              <p className="text-2xl font-bold text-text-primary">{stats.activeJobs}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Data Flow Visualization</h3>
          <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Central hub */}
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              
              {/* Data points */}
              {state.dataSources.map((source, index) => {
                const angle = (index * 2 * Math.PI) / state.dataSources.length
                const radius = 80
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius
                
                return (
                  <div
                    key={source.sourceId}
                    className="absolute w-8 h-8 bg-accent rounded-full data-point flex items-center justify-center"
                    style={{
                      transform: `translate(${x}px, ${y}px)`
                    }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Recent Activities</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="space-y-4">
            {state.datasets.slice(0, 3).map((dataset) => (
              <div key={dataset.datasetId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">{dataset.name}</p>
                  <p className="text-sm text-text-secondary">
                    {dataset.rowCount} rows • {format(new Date(dataset.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="w-2 h-2 bg-accent rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="default" className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="p-4 h-auto flex-col">
            <Database className="w-6 h-6 mb-2" />
            <span>Add Data Source</span>
          </Button>
          <Button variant="outline" className="p-4 h-auto flex-col">
            <Wrench className="w-6 h-6 mb-2" />
            <span>Clean Dataset</span>
          </Button>
          <Button variant="outline" className="p-4 h-auto flex-col">
            <TrendingUp className="w-6 h-6 mb-2" />
            <span>Merge Datasets</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}