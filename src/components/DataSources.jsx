import React, { useState } from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { DataSourceConfigForm } from './DataSourceConfigForm'
import { 
  Plus, 
  Globe, 
  Database, 
  Play, 
  Pause, 
  Trash2,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

export function DataSources({ state, dispatch }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedType, setSelectedType] = useState('scrape')

  const handleAddSource = (sourceData) => {
    dispatch({
      type: 'ADD_DATA_SOURCE',
      payload: sourceData
    })
    setShowAddForm(false)
  }

  const handleDeleteSource = (sourceId) => {
    dispatch({
      type: 'DELETE_DATA_SOURCE',
      payload: sourceId
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Data Sources</h1>
          <p className="text-white/70">Configure and manage your data collection sources</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Source
        </Button>
      </div>

      {/* Add Source Form */}
      {showAddForm && (
        <Card variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Add New Data Source</h3>
          <div className="mb-4">
            <div className="flex gap-2">
              <Button
                variant={selectedType === 'scrape' ? 'primary' : 'outline'}
                onClick={() => setSelectedType('scrape')}
              >
                <Globe className="w-4 h-4 mr-2" />
                Web Scraper
              </Button>
              <Button
                variant={selectedType === 'api' ? 'primary' : 'outline'}
                onClick={() => setSelectedType('api')}
              >
                <Database className="w-4 h-4 mr-2" />
                API Connector
              </Button>
            </div>
          </div>
          
          <DataSourceConfigForm
            type={selectedType}
            onSubmit={handleAddSource}
            onCancel={() => setShowAddForm(false)}
          />
        </Card>
      )}

      {/* Data Sources List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {state.dataSources.map((source) => (
          <Card key={source.sourceId} variant="interactive" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {source.type === 'scrape' ? (
                  <Globe className="w-8 h-8 text-primary" />
                ) : (
                  <Database className="w-8 h-8 text-accent" />
                )}
                <div>
                  <h3 className="font-semibold text-text-primary">{source.name}</h3>
                  <p className="text-sm text-text-secondary capitalize">{source.type} Source</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {source.status === 'active' ? (
                  <CheckCircle className="w-5 h-5 text-accent" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                )}
                <span className="text-sm text-text-secondary capitalize">{source.status}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {source.type === 'scrape' ? (
                <>
                  <div>
                    <span className="text-sm font-medium text-text-secondary">URL: </span>
                    <span className="text-sm text-text-primary">{source.config.url}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-secondary">Schedule: </span>
                    <span className="text-sm text-text-primary capitalize">{source.config.schedule}</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-sm font-medium text-text-secondary">Endpoint: </span>
                    <span className="text-sm text-text-primary">{source.config.endpoint}</span>
                  </div>
                </>
              )}
              {source.lastRun && (
                <div>
                  <span className="text-sm font-medium text-text-secondary">Last Run: </span>
                  <span className="text-sm text-text-primary">
                    {format(new Date(source.lastRun), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Play className="w-4 h-4 mr-1" />
                Run Now
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Configure
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteSource(source.sourceId)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}