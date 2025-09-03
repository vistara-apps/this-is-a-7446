import React, { useState } from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { DataTable } from './ui/DataTable'
import { 
  Merge, 
  Plus, 
  ArrowRight, 
  Download,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react'

export function DataMerging({ state, dispatch }) {
  const [selectedDatasets, setSelectedDatasets] = useState([])
  const [mergeKey, setMergeKey] = useState('')
  const [newDatasetName, setNewDatasetName] = useState('')
  const [previewData, setPreviewData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSelectDataset = (dataset) => {
    if (selectedDatasets.find(d => d.datasetId === dataset.datasetId)) {
      setSelectedDatasets(prev => prev.filter(d => d.datasetId !== dataset.datasetId))
    } else {
      setSelectedDatasets(prev => [...prev, dataset])
    }
    setPreviewData(null)
  }

  const handlePreviewMerge = () => {
    if (selectedDatasets.length < 2 || !mergeKey) return

    setIsProcessing(true)
    
    // Simulate merge processing
    setTimeout(() => {
      const merged = performMerge(selectedDatasets, mergeKey)
      setPreviewData(merged)
      setIsProcessing(false)
    }, 1000)
  }

  const handleExecuteMerge = () => {
    if (!previewData || !newDatasetName) return

    dispatch({
      type: 'MERGE_DATASETS',
      payload: {
        sourceDatasets: selectedDatasets,
        mergeKey,
        newName: newDatasetName
      }
    })

    alert('Datasets merged successfully!')
    setSelectedDatasets([])
    setMergeKey('')
    setNewDatasetName('')
    setPreviewData(null)
  }

  const performMerge = (datasets, key) => {
    // Simple merge: combine all records
    const merged = []
    datasets.forEach(dataset => {
      const data = dataset.cleanedData || dataset.rawData || []
      merged.push(...data)
    })
    return merged
  }

  const getCommonFields = () => {
    if (selectedDatasets.length === 0) return []
    
    const allFields = selectedDatasets.map(dataset => 
      Object.keys(dataset.schema || {})
    )
    
    return allFields.reduce((common, fields) => 
      common.filter(field => fields.includes(field))
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Data Merging</h1>
          <p className="text-white/70">Combine multiple datasets into unified collections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dataset Selection */}
        <Card variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Select Datasets to Merge
          </h3>
          
          <div className="space-y-3 mb-6">
            {state.datasets.map((dataset) => (
              <div
                key={dataset.datasetId}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedDatasets.find(d => d.datasetId === dataset.datasetId)
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectDataset(dataset)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-text-primary">{dataset.name}</div>
                    <div className="text-sm text-text-secondary">
                      {dataset.rowCount || 0} rows • {Object.keys(dataset.schema || {}).length} fields
                    </div>
                  </div>
                  {selectedDatasets.find(d => d.datasetId === dataset.datasetId) && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-text-secondary">
            Selected: {selectedDatasets.length} datasets
          </div>
        </Card>

        {/* Merge Configuration */}
        <Card variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Merge Configuration
          </h3>

          {selectedDatasets.length >= 2 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Merge Key (Common Field)
                </label>
                <select
                  value={mergeKey}
                  onChange={(e) => setMergeKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select merge key...</option>
                  {getCommonFields().map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>

              <Input
                label="New Dataset Name"
                value={newDatasetName}
                onChange={(e) => setNewDatasetName(e.target.value)}
                placeholder="Enter name for merged dataset"
              />

              <Button 
                variant="primary" 
                onClick={handlePreviewMerge}
                disabled={!mergeKey || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Merge className="w-4 h-4 mr-2" />
                    Preview Merge
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-text-secondary">
              <AlertTriangle className="w-5 h-5" />
              <span>Select at least 2 datasets to merge</span>
            </div>
          )}
        </Card>
      </div>

      {/* Selected Datasets Flow */}
      {selectedDatasets.length > 0 && (
        <Card variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Merge Flow</h3>
          
          <div className="flex flex-wrap items-center gap-4">
            {selectedDatasets.map((dataset, index) => (
              <React.Fragment key={dataset.datasetId}>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-text-primary">
                    {dataset.name}
                  </span>
                  <span className="text-xs text-text-secondary">
                    ({dataset.rowCount || 0} rows)
                  </span>
                  <button
                    onClick={() => handleSelectDataset(dataset)}
                    className="text-text-secondary hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {index < selectedDatasets.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-text-secondary" />
                )}
              </React.Fragment>
            ))}
            
            {selectedDatasets.length >= 2 && (
              <>
                <ArrowRight className="w-5 h-5 text-text-secondary" />
                <div className="px-3 py-2 bg-accent/10 border border-accent rounded-lg">
                  <span className="text-sm font-medium text-accent">
                    Merged Dataset
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Preview Results */}
      {previewData && (
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Merge Preview</h3>
              <p className="text-sm text-text-secondary">
                {previewData.length} total rows after merge
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Preview
              </Button>
              <Button 
                variant="accent" 
                onClick={handleExecuteMerge}
                disabled={!newDatasetName}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Execute Merge
              </Button>
            </div>
          </div>
          
          <DataTable 
            data={previewData}
            schema={{}}
            maxRows={10}
          />
        </Card>
      )}
    </div>
  )
}