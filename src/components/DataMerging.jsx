import React, { useState, useEffect } from 'react'
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
  X,
  RefreshCw,
  Info,
  Settings,
  ChevronDown,
  ChevronUp,
  Save
} from 'lucide-react'
import { 
  mergeDatasets, 
  getCommonFields, 
  getAllFields,
  getMergeStats,
  JOIN_TYPES,
  CONFLICT_STRATEGIES
} from '../services/dataMergingService'

export function DataMerging({ state, dispatch }) {
  const [selectedDatasets, setSelectedDatasets] = useState([])
  const [mergeKey, setMergeKey] = useState('')
  const [joinType, setJoinType] = useState('inner')
  const [conflictStrategy, setConflictStrategy] = useState('first')
  const [newDatasetName, setNewDatasetName] = useState('')
  const [previewData, setPreviewData] = useState(null)
  const [mergeSchema, setMergeSchema] = useState({})
  const [mergeStats, setMergeStats] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [error, setError] = useState(null)

  // Reset state when datasets change
  useEffect(() => {
    setPreviewData(null)
    setMergeSchema({})
    setMergeStats(null)
    setError(null)
  }, [selectedDatasets, mergeKey, joinType, conflictStrategy])

  // Update new dataset name when selected datasets change
  useEffect(() => {
    if (selectedDatasets.length >= 2) {
      const baseName = selectedDatasets.map(d => d.name.split(' ')[0]).join('_');
      setNewDatasetName(`${baseName}_merged`);
    } else {
      setNewDatasetName('');
    }
  }, [selectedDatasets]);

  const handleSelectDataset = (dataset) => {
    if (selectedDatasets.find(d => d.datasetId === dataset.datasetId)) {
      setSelectedDatasets(prev => prev.filter(d => d.datasetId !== dataset.datasetId))
    } else {
      setSelectedDatasets(prev => [...prev, dataset])
    }
    setPreviewData(null)
    setMergeSchema({})
    setMergeStats(null)
  }

  const handlePreviewMerge = () => {
    if (selectedDatasets.length < 2 || !mergeKey) {
      setError('Please select at least 2 datasets and a merge key');
      return;
    }

    setIsProcessing(true)
    setError(null)
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      try {
        // Perform the merge
        const mergeResult = mergeDatasets(selectedDatasets, {
          mergeKey,
          joinType,
          conflictStrategy,
          includeSourceInfo: true
        });
        
        setPreviewData(mergeResult.data);
        setMergeSchema(mergeResult.schema);
        setMergeStats(mergeResult.stats);
      } catch (err) {
        console.error('Error during data merging:', err);
        setError(err.message || 'An error occurred during merging');
      } finally {
        setIsProcessing(false);
      }
    }, 500);
  }

  const handleExecuteMerge = () => {
    if (!previewData || !newDatasetName) {
      setError('Please provide a name for the merged dataset');
      return;
    }

    dispatch({
      type: 'MERGE_DATASETS',
      payload: {
        sourceDatasets: selectedDatasets,
        mergeKey,
        newName: newDatasetName,
        schema: mergeSchema
      }
    })

    // Show success message
    alert('Datasets merged successfully!');
    
    // Reset state
    setSelectedDatasets([]);
    setMergeKey('');
    setNewDatasetName('');
    setPreviewData(null);
    setMergeSchema({});
    setMergeStats(null);
  }

  const handleExportData = () => {
    if (!previewData) return;
    
    // Create CSV content
    const headers = Object.keys(previewData[0] || {})
      .filter(key => !key.startsWith('_'))
      .join(',');
      
    const rows = previewData.map(row => 
      Object.entries(row)
        .filter(([key]) => !key.startsWith('_'))
        .map(([_, value]) => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        )
        .join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${newDatasetName || 'merged_data'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Get common fields across selected datasets
  const commonFields = getCommonFields(selectedDatasets);
  
  // Get all fields across selected datasets
  const allFields = getAllFields(selectedDatasets);

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
          
          <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
            {state.datasets.length === 0 ? (
              <div className="text-text-secondary text-center py-4">
                No datasets available. Create a dataset first.
              </div>
            ) : (
              state.datasets.map((dataset) => (
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
              ))
            )}
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
                  {commonFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
                {commonFields.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    No common fields found across selected datasets
                  </p>
                )}
              </div>

              <Input
                label="New Dataset Name"
                value={newDatasetName}
                onChange={(e) => setNewDatasetName(e.target.value)}
                placeholder="Enter name for merged dataset"
              />

              <div>
                <button
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary"
                >
                  {showAdvancedOptions ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  Advanced Options
                </button>
                
                {showAdvancedOptions && (
                  <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-md">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Join Type
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {JOIN_TYPES.map(type => (
                          <button
                            key={type.id}
                            onClick={() => setJoinType(type.id)}
                            className={`p-2 border rounded-md text-left text-sm ${
                              joinType === type.id
                                ? 'border-primary bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{type.icon}</span>
                              <div>
                                <div className="font-medium">{type.name}</div>
                                <div className="text-xs text-text-secondary">{type.description}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Conflict Resolution
                      </label>
                      <select
                        value={conflictStrategy}
                        onChange={(e) => setConflictStrategy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {CONFLICT_STRATEGIES.map(strategy => (
                          <option key={strategy.id} value={strategy.id}>
                            {strategy.name} - {strategy.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <Button 
                variant="primary" 
                onClick={handlePreviewMerge}
                disabled={!mergeKey || isProcessing || commonFields.length === 0}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-text-secondary mb-1">
                      {JOIN_TYPES.find(t => t.id === joinType)?.name || 'Join'}
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-secondary" />
                  </div>
                )}
              </React.Fragment>
            ))}
            
            {selectedDatasets.length >= 2 && (
              <>
                <ArrowRight className="w-5 h-5 text-text-secondary" />
                <div className="px-3 py-2 bg-accent/10 border border-accent rounded-lg">
                  <span className="text-sm font-medium text-accent">
                    {newDatasetName || 'Merged Dataset'}
                  </span>
                  {mergeStats && (
                    <span className="text-xs text-text-secondary ml-2">
                      ({mergeStats.rowCount} rows)
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          
          {mergeKey && (
            <div className="mt-4 text-sm text-text-secondary">
              <span className="font-medium">Merge Key:</span> {mergeKey}
              {joinType !== 'union' && (
                <span className="ml-4">
                  <span className="font-medium">Join Type:</span> {JOIN_TYPES.find(t => t.id === joinType)?.name}
                </span>
              )}
              <span className="ml-4">
                <span className="font-medium">Conflict Strategy:</span> {CONFLICT_STRATEGIES.find(s => s.id === conflictStrategy)?.name}
              </span>
            </div>
          )}
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
              <Button 
                variant="outline"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Preview
              </Button>
              <Button 
                variant="accent" 
                onClick={handleExecuteMerge}
                disabled={!newDatasetName}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Merged Dataset
              </Button>
            </div>
          </div>
          
          {mergeStats && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-text-secondary">Source Datasets</div>
                <div className="text-lg font-semibold">{mergeStats.sourceDatasets}</div>
              </div>
              <div>
                <div className="text-xs text-text-secondary">Total Source Rows</div>
                <div className="text-lg font-semibold">{selectedDatasets.reduce((sum, d) => sum + (d.rowCount || 0), 0)}</div>
              </div>
              <div>
                <div className="text-xs text-text-secondary">Merged Rows</div>
                <div className="text-lg font-semibold">{previewData.length}</div>
              </div>
            </div>
          )}
          
          <DataTable 
            data={previewData.map(row => {
              // Filter out internal fields starting with _
              const filteredRow = {};
              Object.entries(row).forEach(([key, value]) => {
                if (!key.startsWith('_')) {
                  filteredRow[key] = value;
                }
              });
              return filteredRow;
            })}
            schema={mergeSchema}
            maxRows={10}
          />
        </Card>
      )}
    </div>
  )
}

