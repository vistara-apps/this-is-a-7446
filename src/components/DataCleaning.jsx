import React, { useState } from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { DataTable } from './ui/DataTable'
import { 
  Wrench, 
  Play, 
  Download, 
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

const cleaningRules = [
  { id: 'normalize-text', name: 'Normalize Text', description: 'Convert to lowercase, trim whitespace' },
  { id: 'standardize-dates', name: 'Standardize Dates', description: 'Convert to ISO format' },
  { id: 'remove-duplicates', name: 'Remove Duplicates', description: 'Remove duplicate rows' },
  { id: 'fill-missing', name: 'Fill Missing Values', description: 'Replace empty fields with defaults' },
  { id: 'validate-emails', name: 'Validate Emails', description: 'Check email format validity' },
  { id: 'clean-urls', name: 'Clean URLs', description: 'Ensure proper URL format' }
]

export function DataCleaning({ state, dispatch }) {
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [selectedRules, setSelectedRules] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  const handleSelectDataset = (dataset) => {
    setSelectedDataset(dataset)
    setPreviewData(null)
    setSelectedRules([])
  }

  const handleToggleRule = (ruleId) => {
    setSelectedRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    )
  }

  const handlePreview = () => {
    if (!selectedDataset || selectedRules.length === 0) return

    setIsProcessing(true)
    
    // Simulate data cleaning
    setTimeout(() => {
      const cleanedData = applyCleaning(selectedDataset.rawData, selectedRules)
      setPreviewData(cleanedData)
      setIsProcessing(false)
    }, 1500)
  }

  const handleApplyCleaning = () => {
    if (!selectedDataset || !previewData) return

    dispatch({
      type: 'UPDATE_DATASET',
      payload: {
        datasetId: selectedDataset.datasetId,
        cleanedData: previewData
      }
    })

    alert('Data cleaning applied successfully!')
    setPreviewData(null)
    setSelectedRules([])
  }

  const applyCleaning = (data, rules) => {
    return data.map(row => {
      const cleaned = { ...row }
      
      if (rules.includes('normalize-text')) {
        Object.keys(cleaned).forEach(key => {
          if (typeof cleaned[key] === 'string') {
            cleaned[key] = cleaned[key].toLowerCase().trim()
          }
        })
      }
      
      if (rules.includes('standardize-dates')) {
        Object.keys(cleaned).forEach(key => {
          if (key.includes('date') && cleaned[key]) {
            try {
              cleaned[key] = new Date(cleaned[key]).toISOString().split('T')[0]
            } catch (e) {
              // Keep original if parsing fails
            }
          }
        })
      }

      if (rules.includes('clean-urls')) {
        Object.keys(cleaned).forEach(key => {
          if (key.includes('link') || key.includes('url')) {
            if (cleaned[key] && !cleaned[key].startsWith('http')) {
              cleaned[key] = 'https://' + cleaned[key].replace(/^\/+/, '')
            }
          }
        })
      }
      
      return cleaned
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Data Cleaning</h1>
          <p className="text-white/70">Clean and standardize your datasets for better analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dataset Selection */}
        <Card variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Select Dataset</h3>
          <div className="space-y-2">
            {state.datasets.map((dataset) => (
              <button
                key={dataset.datasetId}
                onClick={() => handleSelectDataset(dataset)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedDataset?.datasetId === dataset.datasetId
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-text-primary">{dataset.name}</div>
                <div className="text-sm text-text-secondary">
                  {dataset.rowCount || 0} rows
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Cleaning Rules */}
        <Card variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Cleaning Rules</h3>
          <div className="space-y-3">
            {cleaningRules.map((rule) => (
              <label key={rule.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRules.includes(rule.id)}
                  onChange={() => handleToggleRule(rule.id)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-text-primary">{rule.name}</div>
                  <div className="text-sm text-text-secondary">{rule.description}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-2 mt-6">
            <Button 
              variant="primary" 
              onClick={handlePreview}
              disabled={!selectedDataset || selectedRules.length === 0 || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Preview
            </Button>
          </div>
        </Card>

        {/* Status */}
        <Card variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Cleaning Status</h3>
          
          {!selectedDataset ? (
            <div className="flex items-center gap-2 text-text-secondary">
              <AlertTriangle className="w-5 h-5" />
              <span>Select a dataset to begin</span>
            </div>
          ) : selectedRules.length === 0 ? (
            <div className="flex items-center gap-2 text-text-secondary">
              <AlertTriangle className="w-5 h-5" />
              <span>Choose cleaning rules</span>
            </div>
          ) : previewData ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-accent">
                <CheckCircle className="w-5 h-5" />
                <span>Preview ready</span>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Original rows:</span> {selectedDataset.rawData?.length || 0}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Cleaned rows:</span> {previewData.length}
                </div>
              </div>
              <Button 
                variant="accent" 
                onClick={handleApplyCleaning}
                className="w-full"
              >
                Apply Cleaning
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Dataset:</span> {selectedDataset.name}
              </div>
              <div className="text-sm">
                <span className="font-medium">Rules selected:</span> {selectedRules.length}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Data Preview */}
      {(selectedDataset || previewData) && (
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              {previewData ? 'Cleaned Data Preview' : 'Original Data'}
            </h3>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          
          <DataTable 
            data={previewData || selectedDataset?.rawData || []}
            schema={selectedDataset?.schema || {}}
            maxRows={10}
          />
        </Card>
      )}
    </div>
  )
}