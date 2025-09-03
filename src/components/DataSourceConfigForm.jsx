import React, { useState } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

export function DataSourceConfigForm({ type, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    config: type === 'scrape' ? {
      url: '',
      selectors: {
        title: '',
        content: '',
        link: ''
      },
      schedule: 'daily'
    } : {
      endpoint: '',
      params: {},
      headers: {}
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      type
    })
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

  const updateSelector = (selector, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        selectors: {
          ...prev.config.selectors,
          [selector]: value
        }
      }
    }))
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
          <Input
            label="Target URL"
            value={formData.config.url}
            onChange={(e) => updateConfig('url', e.target.value)}
            placeholder="https://example.com"
            required
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">CSS Selectors</label>
            <Input
              label="Title Selector"
              value={formData.config.selectors.title}
              onChange={(e) => updateSelector('title', e.target.value)}
              placeholder="h1, .title, etc."
            />
            <Input
              label="Content Selector"
              value={formData.config.selectors.content}
              onChange={(e) => updateSelector('content', e.target.value)}
              placeholder=".content, .article-body, etc."
            />
            <Input
              label="Link Selector"
              value={formData.config.selectors.link}
              onChange={(e) => updateSelector('link', e.target.value)}
              placeholder="a, .link, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Schedule</label>
            <select
              value={formData.config.schedule}
              onChange={(e) => updateConfig('schedule', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </>
      ) : (
        <>
          <Input
            label="API Endpoint"
            value={formData.config.endpoint}
            onChange={(e) => updateConfig('endpoint', e.target.value)}
            placeholder="https://api.example.com/data"
            required
          />
          
          <Input
            label="Query Parameters (JSON)"
            value={JSON.stringify(formData.config.params)}
            onChange={(e) => {
              try {
                updateConfig('params', JSON.parse(e.target.value || '{}'))
              } catch (err) {
                // Handle invalid JSON
              }
            }}
            placeholder='{"limit": 100, "sort": "date"}'
          />
          
          <Input
            label="Headers (JSON)"
            value={JSON.stringify(formData.config.headers)}
            onChange={(e) => {
              try {
                updateConfig('headers', JSON.parse(e.target.value || '{}'))
              } catch (err) {
                // Handle invalid JSON
              }
            }}
            placeholder='{"Authorization": "Bearer token"}'
          />
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