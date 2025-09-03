import React, { useState, useEffect } from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { DataTable } from './ui/DataTable'
import { 
  Wrench, 
  Play, 
  Download, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Filter,
  Save,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react'
import { 
  applyCleaningRules, 
  getCleaningStats, 
  validateDataset,
  CLEANING_RULE_DEFINITIONS,
  CLEANING_RULE_CATEGORIES
} from '../services/dataCleaningService'

export function DataCleaning({ state, dispatch }) {
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [selectedRules, setSelectedRules] = useState([])
  const [ruleOptions, setRuleOptions] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [cleaningStats, setCleaningStats] = useState(null)
  const [validationResults, setValidationResults] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState(
    CLEANING_RULE_CATEGORIES.map(cat => cat.id)
  )
  const [showRuleConfig, setShowRuleConfig] = useState(null)

  // Reset state when dataset changes
  useEffect(() => {
    setPreviewData(null)
    setCleaningStats(null)
    setValidationResults(null)
    setSelectedRules([])
    setRuleOptions({})
    setShowRuleConfig(null)
  }, [selectedDataset])

  const handleSelectDataset = (dataset) => {
    setSelectedDataset(dataset)
  }

  const handleToggleRule = (ruleId) => {
    setSelectedRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    )
  }

  const handleToggleCategory = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleUpdateRuleOption = (ruleId, option, value) => {
    setRuleOptions(prev => ({
      ...prev,
      [ruleId]: {
        ...(prev[ruleId] || {}),
        [option]: value
      }
    }))
  }

  const handlePreview = () => {
    if (!selectedDataset || selectedRules.length === 0) return

    setIsProcessing(true)
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      try {
        // Apply cleaning rules
        const cleanedData = applyCleaningRules(
          selectedDataset.rawData, 
          selectedRules,
          ruleOptions
        )
        
        // Get cleaning statistics
        const stats = getCleaningStats(selectedDataset.rawData, cleanedData)
        
        // Validate against schema
        const validation = validateDataset(cleanedData, selectedDataset.schema)
        
        setPreviewData(cleanedData)
        setCleaningStats(stats)
        setValidationResults(validation)
      } catch (error) {
        console.error('Error during data cleaning:', error)
        // Show error message to user
      } finally {
        setIsProcessing(false)
      }
    }, 500)
  }

  const handleApplyCleaning = () => {
    if (!selectedDataset || !previewData) return

    dispatch({
      type: 'UPDATE_DATASET',
      payload: {
        datasetId: selectedDataset.datasetId,
        cleanedData: previewData,
        rowCount: previewData.length
      }
    })

    // Show success message
    alert('Data cleaning applied successfully!')
    
    // Reset preview state
    setPreviewData(null)
    setCleaningStats(null)
    setValidationResults(null)
  }

  const handleExportData = () => {
    const dataToExport = previewData || selectedDataset?.rawData
    if (!dataToExport) return
    
    // Create CSV content
    const headers = Object.keys(dataToExport[0] || {}).join(',')
    const rows = dataToExport.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    )
    const csvContent = [headers, ...rows].join('\n')
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${selectedDataset.name}_${previewData ? 'cleaned' : 'raw'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Group rules by category
  const rulesByCategory = CLEANING_RULE_DEFINITIONS.reduce((acc, rule) => {
    const category = rule.category.toLowerCase()
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(rule)
    return acc
  }, {})

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
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {state.datasets.length === 0 ? (
              <div className="text-text-secondary text-center py-4">
                No datasets available. Create a dataset first.
              </div>
            ) : (
              state.datasets.map((dataset) => (
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
                    {dataset.rowCount || 0} rows • {Object.keys(dataset.schema || {}).length} columns
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Cleaning Rules */}
        <Card variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Cleaning Rules</h3>
          
          {selectedDataset ? (
            <>
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {CLEANING_RULE_CATEGORIES.map(category => {
                  const categoryId = category.id
                  const isExpanded = expandedCategories.includes(categoryId)
                  const categoryRules = rulesByCategory[categoryId] || []
                  
                  return (
                    <div key={categoryId} className="border rounded-md overflow-hidden">
                      <button 
                        className="w-full flex items-center justify-between p-3 bg-gray-50 text-left"
                        onClick={() => handleToggleCategory(categoryId)}
                      >
                        <span className="font-medium">{category.name}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-2 space-y-2">
                          {categoryRules.map(rule => (
                            <div key={rule.id} className="space-y-1">
                              <div className="flex items-start gap-2">
                                <input
                                  type="checkbox"
                                  id={`rule-${rule.id}`}
                                  checked={selectedRules.includes(rule.id)}
                                  onChange={() => handleToggleRule(rule.id)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <label 
                                    htmlFor={`rule-${rule.id}`}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <div className="font-medium text-text-primary">{rule.name}</div>
                                    {rule.configurable && selectedRules.includes(rule.id) && (
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault()
                                          setShowRuleConfig(showRuleConfig === rule.id ? null : rule.id)
                                        }}
                                        className="p-1 text-text-secondary hover:text-primary"
                                      >
                                        <Settings className="w-3 h-3" />
                                      </button>
                                    )}
                                  </label>
                                  <div className="text-sm text-text-secondary">{rule.description}</div>
                                </div>
                              </div>
                              
                              {/* Rule configuration UI */}
                              {rule.configurable && showRuleConfig === rule.id && (
                                <div className="ml-6 mt-2 p-3 bg-gray-50 rounded-md">
                                  {rule.id === 'fill-missing' && (
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium">Default Values (JSON)</div>
                                      <Input
                                        value={JSON.stringify(ruleOptions[rule.id]?.defaultValues || {})}
                                        onChange={(e) => {
                                          try {
                                            const defaultValues = JSON.parse(e.target.value || '{}')
                                            handleUpdateRuleOption(rule.id, 'defaultValues', defaultValues)
                                          } catch (err) {
                                            // Handle invalid JSON
                                          }
                                        }}
                                        placeholder='{"field1": "default", "field2": 0}'
                                      />
                                    </div>
                                  )}
                                  
                                  {rule.id === 'remove-special-chars' && (
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium">Fields to Clean (comma-separated)</div>
                                      <Input
                                        value={(ruleOptions[rule.id]?.fields || []).join(', ')}
                                        onChange={(e) => {
                                          const fields = e.target.value.split(',').map(f => f.trim()).filter(Boolean)
                                          handleUpdateRuleOption(rule.id, 'fields', fields)
                                        }}
                                        placeholder="field1, field2, field3"
                                      />
                                    </div>
                                  )}
                                  
                                  {rule.id === 'format-phones' && (
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium">Phone Format</div>
                                      <select
                                        value={ruleOptions[rule.id]?.format || '(XXX) XXX-XXXX'}
                                        onChange={(e) => handleUpdateRuleOption(rule.id, 'format', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      >
                                        <option value="(XXX) XXX-XXXX">(XXX) XXX-XXXX</option>
                                        <option value="XXX-XXX-XXXX">XXX-XXX-XXXX</option>
                                        <option value="XXX.XXX.XXXX">XXX.XXX.XXXX</option>
                                      </select>
                                    </div>
                                  )}
                                  
                                  {rule.id === 'convert-case' && (
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium">Case Type</div>
                                      <select
                                        value={ruleOptions[rule.id]?.caseType || 'title'}
                                        onChange={(e) => handleUpdateRuleOption(rule.id, 'caseType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                      >
                                        <option value="upper">UPPERCASE</option>
                                        <option value="lower">lowercase</option>
                                        <option value="title">Title Case</option>
                                      </select>
                                      
                                      <div className="text-sm font-medium mt-2">Fields to Convert (comma-separated)</div>
                                      <Input
                                        value={(ruleOptions[rule.id]?.fields || []).join(', ')}
                                        onChange={(e) => {
                                          const fields = e.target.value.split(',').map(f => f.trim()).filter(Boolean)
                                          handleUpdateRuleOption(rule.id, 'fields', fields)
                                        }}
                                        placeholder="field1, field2, field3"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
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
                  Preview Cleaning
                </Button>
              </div>
            </>
          ) : (
            <div className="text-text-secondary text-center py-4">
              Select a dataset to view available cleaning rules
            </div>
          )}
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
                
                {cleaningStats && (
                  <>
                    {cleaningStats.duplicatesRemoved > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Duplicates removed:</span> {cleaningStats.duplicatesRemoved}
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-medium">Fields modified:</span> {cleaningStats.modifiedFields} of {cleaningStats.totalFields}
                      {cleaningStats.totalFields > 0 && (
                        <span className="ml-1 text-text-secondary">
                          ({cleaningStats.modificationRate.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </>
                )}
                
                {validationResults && (
                  <div className={`text-sm ${validationResults.valid ? 'text-accent' : 'text-red-500'}`}>
                    <span className="font-medium">Validation:</span> {validationResults.valid ? 'Passed' : 'Failed'}
                    {!validationResults.valid && validationResults.errors.length > 0 && (
                      <div className="text-xs mt-1 text-red-500">
                        {validationResults.errors[0]}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="accent" 
                  onClick={handleApplyCleaning}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Apply Cleaning
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Dataset:</span> {selectedDataset.name}
              </div>
              <div className="text-sm">
                <span className="font-medium">Rules selected:</span> {selectedRules.length}
              </div>
              <div className="text-sm">
                <span className="font-medium">Schema fields:</span> {Object.keys(selectedDataset.schema || {}).length}
              </div>
              <div className="flex items-center gap-1 text-sm text-text-secondary mt-4">
                <AlertTriangle className="w-4 h-4" />
                <span>Click "Preview Cleaning" to see results</span>
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
            <div className="flex gap-2">
              {previewData && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setPreviewData(null)
                    setCleaningStats(null)
                    setValidationResults(null)
                  }}
                >
                  Show Original
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
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

