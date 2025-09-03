import React, { useState } from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { DataTable } from './ui/DataTable'
import { 
  FolderOpen, 
  Download, 
  Eye, 
  Trash2, 
  Plus,
  BarChart3,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'

export function Datasets({ state, dispatch }) {
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'preview'

  const handleDeleteDataset = (datasetId) => {
    dispatch({
      type: 'DELETE_DATASET',
      payload: datasetId
    })
  }

  const handleViewDataset = (dataset) => {
    setSelectedDataset(dataset)
    setViewMode('preview')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Datasets</h1>
          <p className="text-white/70">View and manage your processed datasets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Dataset
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {state.datasets.map((dataset) => (
            <Card key={dataset.datasetId} variant="interactive" className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-text-primary">{dataset.name}</h3>
                    <p className="text-sm text-text-secondary">
                      {dataset.rowCount || 0} rows
                    </p>
                  </div>
                </div>
                <BarChart3 className="w-5 h-5 text-text-secondary" />
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-sm font-medium text-text-secondary">Sources: </span>
                  <span className="text-sm text-text-primary">
                    {dataset.sourceIds?.length || 0} connected
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-text-secondary">Created: </span>
                  <span className="text-sm text-text-primary">
                    {format(new Date(dataset.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-text-secondary">Schema: </span>
                  <span className="text-sm text-text-primary">
                    {Object.keys(dataset.schema || {}).length} fields
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDataset(dataset)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteDataset(dataset.datasetId)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{selectedDataset?.name}</h2>
              <p className="text-text-secondary">
                {selectedDataset?.rowCount || 0} rows • {Object.keys(selectedDataset?.schema || {}).length} columns
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setViewMode('list')}>
                Back to List
              </Button>
              <Button variant="primary">
                <Download className="w-4 h-4 mr-2" />
                Export Dataset
              </Button>
            </div>
          </div>

          {selectedDataset && (
            <DataTable 
              data={selectedDataset.cleanedData || selectedDataset.rawData || []}
              schema={selectedDataset.schema || {}}
            />
          )}
        </Card>
      )}
    </div>
  )
}