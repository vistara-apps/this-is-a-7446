import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { 
  Globe, 
  Database, 
  Plus, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { 
  SCHEDULE_OPTIONS, 
  COMMON_SELECTORS,
  validateSelectors
} from '../services/webScraperService'
import {
  API_TYPES,
  COMMON_APIS,
  testApiConnection
} from '../services/apiConnectorService'

export function DataSourceConfigForm({ type, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    config: type === 'scrape' ? {
      url: '',
      selectors: {},
      schedule: 'daily'
    } : {
      endpoint: '',
      params: {},
      headers: {},
      authType: 'none',
      authConfig: {}
    }
  })
  
  const [selectorFields, setSelectorFields] = useState([
    { name: 'title', label: 'Title Selector', value: '' },
    { name: 'content', label: 'Content Selector', value: '' }
  ])
  
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionTestResult, setConnectionTestResult] = useState(null)
  const [showSelectorSuggestions, setShowSelectorSuggestions] = useState(false)
  const [activeSelectorField, setActiveSelectorField] = useState(null)
  const [showApiSuggestions, setShowApiSuggestions] = useState(false)

  // Reset form when type changes
  useEffect(() => {
    setFormData({
      name: '',
      config: type === 'scrape' ? {
        url: '',
        selectors: {},
        schedule: 'daily'
      } : {
        endpoint: '',
        params: {},
        headers: {},
        authType: 'none',
        authConfig: {}
      }
    })
    
    setSelectorFields([
      { name: 'title', label: 'Title Selector', value: '' },
      { name: 'content', label: 'Content Selector', value: '' }
    ])
    
    setValidationResult(null)
    setConnectionTestResult(null)
    setShowAdvanced(false)
  }, [type])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // For scrape type, convert selector fields to config.selectors object
    if (type === 'scrape') {
      const selectors = {}
      selectorFields.forEach(field => {
        if (field.value) {
          selectors[field.name] = field.value
        }
      })
      
      onSubmit({
        ...formData,
        config: {
          ...formData.config,
          selectors
        }
      })
    } else {
      onSubmit(formData)
    }
  }

  const updateConfig = (key, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value
      }
    }))
  }

  const updateAuthConfig = (key, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        authConfig: {
          ...prev.config.authConfig,
          [key]: value
        }
      }
    }))
  }

  const handleSelectorChange = (index, value) => {
    const updatedFields = [...selectorFields]
    updatedFields[index].value = value
    setSelectorFields(updatedFields)
  }

  const addSelectorField = () => {
    setSelectorFields([
      ...selectorFields,
      { name: '', label: 'Custom Selector', value: '' }
    ])
  }

  const removeSelectorField = (index) => {
    setSelectorFields(selectorFields.filter((_, i) => i !== index))
  }

  const updateSelectorFieldName = (index, name) => {
    const updatedFields = [...selectorFields]
    updatedFields[index].name = name
    updatedFields[index].label = `${name.charAt(0).toUpperCase() + name.slice(1)} Selector`
    setSelectorFields(updatedFields)
  }

  const handleValidateSelectors = async () => {
    if (!formData.config.url) return
    
    setIsValidating(true)
    setValidationResult(null)
    
    try {
      // Convert selector fields to object
      const selectors = {}
      selectorFields.forEach(field => {
        if (field.value) {
          selectors[field.name] = field.value
        }
      })
      
      // Call validation service
      const result = await validateSelectors(formData.config.url, selectors)
      setValidationResult(result)
    } catch (error) {
      setValidationResult({
        success: false,
        error: error.message
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleTestConnection = async () => {
    if (!formData.config.endpoint) return
    
    setIsTestingConnection(true)
    setConnectionTestResult(null)
    
    try {
      // Call test connection service
      const result = await testApiConnection(formData.config)
      setConnectionTestResult(result)
    } catch (error) {
      setConnectionTestResult({
        success: false,
        message: 'Connection test failed',
        error: error.message
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSelectSelectorSuggestion = (suggestion) => {
    if (activeSelectorField === null) return
    
    const updatedFields = [...selectorFields]
    updatedFields[activeSelectorField].value = suggestion.selector
    setSelectorFields(updatedFields)
    setShowSelectorSuggestions(false)
  }

  const handleSelectApiSuggestion = (api) => {
    setFormData(prev => ({
      ...prev,
      name: api.name,
      config: {
        ...prev.config,
        endpoint: api.endpoint,
        authType: api.authType
      }
    }))
    setShowApiSuggestions(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Source Name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Enter a name for this data source"
        required
      />

      {type === 'scrape' ? (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">Target URL</label>
            <div className="flex gap-2">
              <Input
                value={formData.config.url}
                onChange={(e) => updateConfig('url', e.target.value)}
                placeholder="https://example.com"
                required
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={handleValidateSelectors}
                disabled={!formData.config.url || isValidating}
              >
                {isValidating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Validate'
                )}
              </Button>
            </div>
            
            {validationResult && (
              <div className={`mt-2 p-2 rounded-md text-sm ${
                validationResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {validationResult.success ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>URL is valid and accessible</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{validationResult.error || 'Failed to validate URL'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-text-primary">CSS Selectors</label>
              <button
                type="button"
                onClick={() => setShowSelectorSuggestions(!showSelectorSuggestions)}
                className="text-sm text-primary hover:text-primary/80"
              >
                View Suggestions
              </button>
            </div>
            
            {showSelectorSuggestions && (
              <div className="mt-2 p-3 border rounded-md bg-gray-50 max-h-60 overflow-y-auto">
                <h4 className="font-medium mb-2">Common Selector Patterns</h4>
                <div className="space-y-3">
                  {Object.entries(COMMON_SELECTORS).map(([category, suggestions]) => (
                    <div key={category} className="space-y-1">
                      <h5 className="text-sm font-medium">{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                      <div className="space-y-1">
                        {suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectSelectorSuggestion(suggestion)}
                            className="block w-full text-left p-1.5 text-sm hover:bg-blue-50 rounded"
                          >
                            <div className="font-medium">{suggestion.name}</div>
                            <div className="text-xs text-text-secondary">{suggestion.selector}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {selectorFields.map((field, index) => (
                <div key={index} className="flex gap-2">
                  {index > 1 && (
                    <Input
                      value={field.name}
                      onChange={(e) => updateSelectorFieldName(index, e.target.value)}
                      placeholder="Field name"
                      className="w-1/3"
                    />
                  )}
                  <div className="relative flex-1">
                    <Input
                      label={index <= 1 ? field.label : undefined}
                      value={field.value}
                      onChange={(e) => handleSelectorChange(index, e.target.value)}
                      placeholder="CSS selector (e.g., h1, .title, #content)"
                      onFocus={() => setActiveSelectorField(index)}
                    />
                    
                    {validationResult?.results && field.name in validationResult.results && (
                      <div className="absolute right-2 top-8">
                        {validationResult.results[field.name].valid ? (
                          <div className="text-green-500 flex items-center" title={`Found ${validationResult.results[field.name].matches} matches`}>
                            <CheckCircle className="w-4 h-4" />
                            <span className="ml-1 text-xs">{validationResult.results[field.name].matches}</span>
                          </div>
                        ) : (
                          <div className="text-red-500" title="No matches found">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {index > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeSelectorField(index)}
                      className="p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addSelectorField}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Selector
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Schedule</label>
            <select
              value={formData.config.schedule}
              onChange={(e) => updateConfig('schedule', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SCHEDULE_OPTIONS.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name} - {option.description}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">API Endpoint</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={formData.config.endpoint}
                  onChange={(e) => updateConfig('endpoint', e.target.value)}
                  placeholder="https://api.example.com/data"
                  required
                  className="pr-8"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-text-secondary hover:text-primary"
                  onClick={() => setShowApiSuggestions(!showApiSuggestions)}
                >
                  <Info className="w-4 h-4" />
                </button>
                
                {showApiSuggestions && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b">
                      <h4 className="font-medium">Common APIs</h4>
                    </div>
                    <div>
                      {COMMON_APIS.map((api, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectApiSuggestion(api)}
                          className="block w-full text-left p-2 hover:bg-blue-50 border-b"
                        >
                          <div className="font-medium">{api.name}</div>
                          <div className="text-xs text-text-secondary">{api.endpoint}</div>
                          <div className="text-xs text-text-secondary">{api.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleTestConnection}
                disabled={!formData.config.endpoint || isTestingConnection}
              >
                {isTestingConnection ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Test'
                )}
              </Button>
            </div>
            
            {connectionTestResult && (
              <div className={`mt-2 p-2 rounded-md text-sm ${
                connectionTestResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {connectionTestResult.success ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>{connectionTestResult.message}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{connectionTestResult.error || 'Connection failed'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">API Type</label>
            <div className="grid grid-cols-3 gap-2">
              {API_TYPES.map(apiType => (
                <button
                  key={apiType.id}
                  type="button"
                  onClick={() => updateConfig('apiType', apiType.id)}
                  className={`p-2 border rounded-md text-center ${
                    formData.config.apiType === apiType.id
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{apiType.name}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Authentication</label>
            <select
              value={formData.config.authType}
              onChange={(e) => updateConfig('authType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="none">No Authentication</option>
              <option value="api_key">API Key</option>
              <option value="bearer">Bearer Token</option>
              <option value="basic">Basic Auth</option>
              <option value="oauth">OAuth</option>
            </select>
          </div>
          
          {formData.config.authType === 'api_key' && (
            <div className="space-y-2">
              <Input
                label="API Key"
                value={formData.config.authConfig.apiKey || ''}
                onChange={(e) => updateAuthConfig('apiKey', e.target.value)}
                placeholder="Enter your API key"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Key Name"
                  value={formData.config.authConfig.keyName || ''}
                  onChange={(e) => updateAuthConfig('keyName', e.target.value)}
                  placeholder="e.g., api_key, key, token"
                />
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
                  <select
                    value={formData.config.authConfig.keyLocation || 'query'}
                    onChange={(e) => updateAuthConfig('keyLocation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="query">Query Parameter</option>
                    <option value="header">Header</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {formData.config.authType === 'bearer' && (
            <Input
              label="Bearer Token"
              value={formData.config.authConfig.token || ''}
              onChange={(e) => updateAuthConfig('token', e.target.value)}
              placeholder="Enter your bearer token"
              type="password"
            />
          )}
          
          {formData.config.authType === 'basic' && (
            <div className="space-y-2">
              <Input
                label="Username"
                value={formData.config.authConfig.username || ''}
                onChange={(e) => updateAuthConfig('username', e.target.value)}
                placeholder="Enter username"
              />
              <Input
                label="Password"
                value={formData.config.authConfig.password || ''}
                onChange={(e) => updateAuthConfig('password', e.target.value)}
                placeholder="Enter password"
                type="password"
              />
            </div>
          )}
          
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary"
            >
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              Advanced Options
            </button>
            
            {showAdvanced && (
              <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-md">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Query Parameters (JSON)
                  </label>
                  <Input
                    value={JSON.stringify(formData.config.params || {})}
                    onChange={(e) => {
                      try {
                        updateConfig('params', JSON.parse(e.target.value || '{}'))
                      } catch (err) {
                        // Handle invalid JSON
                      }
                    }}
                    placeholder='{"limit": 100, "sort": "date"}'
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Headers (JSON)
                  </label>
                  <Input
                    value={JSON.stringify(formData.config.headers || {})}
                    onChange={(e) => {
                      try {
                        updateConfig('headers', JSON.parse(e.target.value || '{}'))
                      } catch (err) {
                        // Handle invalid JSON
                      }
                    }}
                    placeholder='{"Accept": "application/json"}'
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Schedule</label>
                  <select
                    value={formData.config.schedule || 'daily'}
                    onChange={(e) => updateConfig('schedule', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {SCHEDULE_OPTIONS.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" variant="primary">
          Create Source
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

