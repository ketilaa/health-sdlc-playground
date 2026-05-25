'use client'

import React, { useEffect, useState } from 'react'
import { getDefaultDataset, type Dataset } from '@/data/datasets'
import { DatasetSelector } from './DatasetSelector'
import { LoadingState } from './LoadingState'
import { WeekRow } from './WeekRow'

export function TrainingOverview() {
  const [dataset, setDataset] = useState<Dataset | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDataset(getDefaultDataset())
    }, 0)
    return () => clearTimeout(t)
  }, [])

  const sortedWeeks = dataset ? [...dataset.weeks].sort((a, b) => b.weekNumber - a.weekNumber) : []
  const datasetName = dataset?.name ?? getDefaultDataset().name

  return (
    <div>
      <header
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          padding: '1rem',
          borderBottom: '1px solid #eee',
        }}
      >
        <DatasetSelector currentDatasetName={datasetName} />
      </header>
      <main style={{ padding: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Training Overview</h1>
        <p style={{ color: '#666', marginTop: 0 }}>8 weeks · most recent first</p>
        {!dataset ? (
          <LoadingState />
        ) : (
          <div>
            {sortedWeeks.map((w) => (
              <WeekRow key={w.weekNumber} week={w} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}