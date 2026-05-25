import React, { useState } from 'react'
import { getSelectableDatasets, type Dataset } from '@/data/datasets'

interface Props {
  currentDatasetName: string
}

export function DatasetSelector({ currentDatasetName }: Props) {
  const [open, setOpen] = useState(false)
  const options: Dataset[] = getSelectableDatasets()

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        data-testid="dataset-selector"
        aria-label="Select dataset"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        <span>{currentDatasetName}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Available datasets"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            margin: 0,
            padding: '0.25rem 0',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            listStyle: 'none',
            minWidth: '100%',
          }}
        >
          {options.map((opt) => (
            <li
              key={opt.id}
              role="option"
              aria-selected={opt.name === currentDatasetName}
              style={{ padding: '0.5rem 1rem' }}
            >
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}