import React, { useState } from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { 
  Download, 
  FileText, 
  FileJson, 
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight
} from 'lucide-react'

/**
 * DataExport component for exporting datasets in various formats
 */
export function DataExport({ state, dispatch }) {
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    delimiter: ',',
    dateFormat: 'ISO',
    fileName: ''
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState(null)

  const handleSelectDataset = (dataset) => {
    setSelectedDataset(dataset)
    setExportOptions(prev => ({
      ...prev,
      fileName: `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_export`
    }))
    setExportResult(null)
  }

  const handleExport = () => {
    if (!selectedDataset) return
    
    setIsExporting(true)
    setExportResult(null)
    
    // Use setTimeout to simulate processing
    setTimeout(() => {
      try {
        const data = selectedDataset.cleanedData || selectedDataset.rawData || []
        let content = ''
        let mimeType = ''
        let fileExtension = ''
        
        // Generate export content based on format
        switch (exportFormat) {
          case 'csv':
            content = generateCsvContent(data, exportOptions)
            mimeType = 'text/csv'
            fileExtension = 'csv'
            break
          case 'json':
            content = generateJsonContent(data, exportOptions)
            mimeType = 'application/json'
            fileExtension = 'json'
            break
          case 'excel':
            // In a real app, this would use a library like xlsx
            // For this demo, we'll just use CSV
            content = generateCsvContent(data, exportOptions)
            mimeType = 'text/csv'
            fileExtension = 'csv'
            break
          default:
            throw new Error(`Unsupported export format: ${exportFormat}`)
        }
        
        // Create download link
        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${exportOptions.fileName}.${fileExtension}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        setExportResult({
          success: true,
          message: `Dataset exported successfully as ${exportFormat.toUpperCase()}`,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Export error:', error)
        setExportResult({
          success: false,
          message: error.message || 'Failed to export dataset',
          timestamp: new Date().toISOString()
        })
      } finally {
        setIsExporting(false)
      }
    }, 1000)
  }

  const generateCsvContent = (data, options) => {
    if (!data || data.length === 0) return ''
    
    const { includeHeaders, delimiter } = options
    const headers = Object.keys(data[0])
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`
        return value
      }).join(delimiter)
    )
    
    return includeHeaders 
      ? [headers.join(delimiter), ...rows].join('\n')
      : rows.join('\n')
  }

  const generateJsonContent = (data, options) => {
    return JSON.stringify(data, null, 2)
  }

  const updateExportOption = (key, value) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Data Export</h1>
          <p className="text-white/70">Export your datasets in various formats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dataset Selection */}
        <Card variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Select Dataset to Export
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
                    selectedDataset?.datasetId === dataset.datasetId
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
                    {selectedDataset?.datasetId === dataset.datasetId && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Export Configuration */}
        <Card variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Export Configuration
          </h3>

          {selectedDataset ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormat('csv')}
                    className={`p-3 border rounded-md flex flex-col items-center gap-1 ${
                      exportFormat === 'csv'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-6 h-6 text-text-primary" />
                    <div className="font-medium">CSV</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat('json')}
                    className={`p-3 border rounded-md flex flex-col items-center gap-1 ${
                      exportFormat === 'json'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileJson className="w-6 h-6 text-text-primary" />
                    <div className="font-medium">JSON</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat('excel')}
                    className={`p-3 border rounded-md flex flex-col items-center gap-1 ${
                      exportFormat === 'excel'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileSpreadsheet className="w-6 h-6 text-text-primary" />
                    <div className="font-medium">Excel</div>
                  </button>
                </div>
              </div>

              <Input
                label="File Name"
                value={exportOptions.fileName}
                onChange={(e) => updateExportOption('fileName', e.target.value)}
                placeholder="Enter file name (without extension)"
              />

              {exportFormat === 'csv' && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeHeaders"
                      checked={exportOptions.includeHeaders}
                      onChange={(e) => updateExportOption('includeHeaders', e.target.checked)}
                    />
                    <label htmlFor="includeHeaders" className="text-sm">
                      Include Headers
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Delimiter
                    </label>
                    <select
                      value={exportOptions.delimiter}
                      onChange={(e) => updateExportOption('delimiter', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value=",">Comma (,)</option>
                      <option value=";">Semicolon (;)</option>
                      <option value="\t">Tab</option>
                      <option value="|">Pipe (|)</option>
                    </select>
                  </div>
                </div>
              )}

              {exportResult && (
                <div className={`p-3 rounded-md ${
                  exportResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {exportResult.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    <span>{exportResult.message}</span>
                  </div>
                </div>
              )}

              <Button 
                variant="primary" 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Dataset
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-text-secondary">
              <AlertTriangle className="w-5 h-5" />
              <span>Select a dataset to export</span>
            </div>
          )}
        </Card>
      </div>

      {/* Export Preview */}
      {selectedDataset && (
        <Card variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Data Preview
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {selectedDataset && (selectedDataset.cleanedData || selectedDataset.rawData) && 
                   Object.keys(selectedDataset.cleanedData?.[0] || selectedDataset.rawData?.[0] || {}).map((column) => (
                    <th
                      key={column}
                      className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedDataset && (selectedDataset.cleanedData || selectedDataset.rawData) && 
                 (selectedDataset.cleanedData || selectedDataset.rawData).slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-text-primary"
                      >
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {selectedDataset && (selectedDataset.cleanedData || selectedDataset.rawData) && 
             (selectedDataset.cleanedData || selectedDataset.rawData).length > 5 && (
              <div className="text-center py-3 text-sm text-text-secondary bg-gray-50">
                Showing 5 of {(selectedDataset.cleanedData || selectedDataset.rawData).length} rows
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

