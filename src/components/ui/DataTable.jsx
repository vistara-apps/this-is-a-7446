import React from 'react'

export function DataTable({ data = [], schema = {}, maxRows = null }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        <p>No data available</p>
      </div>
    )
  }

  const displayData = maxRows ? data.slice(0, maxRows) : data
  const columns = Object.keys(data[0] || {})

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
              >
                {column}
                {schema[column] && (
                  <span className="ml-1 text-xs text-gray-400">
                    ({schema[column]})
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayData.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={column}
                  className="px-6 py-4 whitespace-nowrap text-sm text-text-primary"
                >
                  {renderCellValue(row[column], schema[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {maxRows && data.length > maxRows && (
        <div className="text-center py-3 text-sm text-text-secondary bg-gray-50">
          Showing {maxRows} of {data.length} rows
        </div>
      )}
    </div>
  )
}

function renderCellValue(value, type) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">—</span>
  }

  if (type === 'url' && typeof value === 'string') {
    return (
      <a 
        href={value} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline truncate max-w-xs block"
      >
        {value}
      </a>
    )
  }

  if (type === 'date' && value) {
    try {
      return new Date(value).toLocaleDateString()
    } catch (e) {
      return value
    }
  }

  if (typeof value === 'string' && value.length > 50) {
    return (
      <span title={value} className="truncate max-w-xs block">
        {value.substring(0, 50)}...
      </span>
    )
  }

  return String(value)
}