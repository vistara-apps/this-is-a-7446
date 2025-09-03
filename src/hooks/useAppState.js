import { useReducer } from 'react'
import { format } from 'date-fns'

const initialState = {
  user: {
    userId: 'user-1',
    email: 'demo@datamosaic.com',
    subscriptionTier: 'pro',
    createdAt: new Date().toISOString()
  },
  dataSources: [
    {
      sourceId: 'source-1',
      userId: 'user-1',
      type: 'scrape',
      name: 'Tech News Scraper',
      config: {
        url: 'https://techcrunch.com',
        selectors: {
          title: 'h2.post-block__title',
          link: 'a.post-block__title__link'
        },
        schedule: 'daily'
      },
      status: 'active',
      lastRun: new Date().toISOString()
    },
    {
      sourceId: 'source-2',
      userId: 'user-1',
      type: 'api',
      name: 'GitHub API',
      config: {
        endpoint: 'https://api.github.com/users',
        params: { per_page: 100 },
        headers: {}
      },
      status: 'active',
      lastRun: new Date().toISOString()
    }
  ],
  datasets: [
    {
      datasetId: 'dataset-1',
      userId: 'user-1',
      name: 'Tech Articles Dataset',
      sourceIds: ['source-1'],
      rawData: [
        { title: 'AI Breakthrough in 2024', link: '/ai-breakthrough', date: '2024-01-15' },
        { title: 'New React Features', link: '/react-features', date: '2024-01-14' }
      ],
      cleanedData: [
        { title: 'AI Breakthrough in 2024', link: 'https://techcrunch.com/ai-breakthrough', date: '2024-01-15' },
        { title: 'New React Features', link: 'https://techcrunch.com/react-features', date: '2024-01-14' }
      ],
      schema: {
        title: 'string',
        link: 'url',
        date: 'date'
      },
      createdAt: new Date().toISOString(),
      rowCount: 2
    },
    {
      datasetId: 'dataset-2',
      userId: 'user-1',
      name: 'GitHub Users Dataset',
      sourceIds: ['source-2'],
      rawData: [
        { login: 'octocat', id: 1, name: 'The Octocat' },
        { login: 'defunkt', id: 2, name: 'Chris Wanstrath' }
      ],
      cleanedData: [
        { username: 'octocat', user_id: 1, full_name: 'The Octocat' },
        { username: 'defunkt', user_id: 2, full_name: 'Chris Wanstrath' }
      ],
      schema: {
        username: 'string',
        user_id: 'number',
        full_name: 'string'
      },
      createdAt: new Date().toISOString(),
      rowCount: 2
    }
  ],
  scrapeJobs: [
    {
      jobId: 'job-1',
      dataSourceId: 'source-1',
      url: 'https://techcrunch.com',
      selectors: {
        title: 'h2.post-block__title',
        link: 'a.post-block__title__link'
      },
      schedule: 'daily',
      status: 'completed',
      lastRun: new Date().toISOString()
    }
  ]
}

function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_DATA_SOURCE':
      return {
        ...state,
        dataSources: [...state.dataSources, {
          ...action.payload,
          sourceId: `source-${Date.now()}`,
          userId: state.user.userId,
          status: 'active'
        }]
      }
    
    case 'DELETE_DATA_SOURCE':
      return {
        ...state,
        dataSources: state.dataSources.filter(source => source.sourceId !== action.payload)
      }
    
    case 'ADD_DATASET':
      return {
        ...state,
        datasets: [...state.datasets, {
          ...action.payload,
          datasetId: `dataset-${Date.now()}`,
          userId: state.user.userId,
          createdAt: new Date().toISOString()
        }]
      }
    
    case 'UPDATE_DATASET':
      return {
        ...state,
        datasets: state.datasets.map(dataset => 
          dataset.datasetId === action.payload.datasetId 
            ? { ...dataset, ...action.payload }
            : dataset
        )
      }
    
    case 'DELETE_DATASET':
      return {
        ...state,
        datasets: state.datasets.filter(dataset => dataset.datasetId !== action.payload)
      }
    
    case 'MERGE_DATASETS':
      const { sourceDatasets, mergeKey, newName } = action.payload
      const mergedData = []
      const mergedSchema = {}
      
      // Simple merge logic - combine all data and schemas
      sourceDatasets.forEach(dataset => {
        mergedData.push(...(dataset.cleanedData || dataset.rawData))
        Object.assign(mergedSchema, dataset.schema)
      })
      
      return {
        ...state,
        datasets: [...state.datasets, {
          datasetId: `dataset-${Date.now()}`,
          userId: state.user.userId,
          name: newName,
          sourceIds: sourceDatasets.flatMap(d => d.sourceIds),
          rawData: mergedData,
          cleanedData: mergedData,
          schema: mergedSchema,
          createdAt: new Date().toISOString(),
          rowCount: mergedData.length
        }]
      }
    
    default:
      return state
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialState)
  return { state, dispatch }
}