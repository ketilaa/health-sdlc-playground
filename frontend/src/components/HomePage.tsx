'use client'

import React, { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { WeeklyDashboard } from './WeeklyDashboard'
import RunnerDashboard from './RunnerDashboard'

export default function HomePage() {
  const [dataset, setDataset] = useState('demo')

  return (
    <>
      <AppBar position="sticky" elevation={4} component="header">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            component="h1"
            sx={{ fontWeight: 700 }}
          >
            Health Playground
          </Typography>

          <div data-testid="dataset-selector">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel
                id="dataset-selector-label"
                sx={{ color: 'inherit' }}
                htmlFor="dataset-selector-input"
              >
                Dataset
              </InputLabel>
              <Select
                labelId="dataset-selector-label"
                inputProps={{ id: 'dataset-selector-input' }}
                value={dataset}
                label="Dataset"
                onChange={(e) => setDataset(e.target.value)}
                aria-label="Select dataset"
                sx={{ color: 'inherit' }}
              >
                <MenuItem value="demo">Demo Dataset</MenuItem>
              </Select>
            </FormControl>
          </div>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{ pt: 2, px: 2 }}
      >
        <Box
          data-testid="content-area"
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            alignItems: 'flex-start',
          }}
        >
          {/* Left Column */}
          <Box
            data-testid="left-column"
            sx={{
              flex: '0 0 50%',
              maxWidth: '50%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Paper
              component="section"
              data-testid="training-overview"
              role="region"
              aria-labelledby="training-overview-heading"
              elevation={2}
              sx={{ p: 2 }}
            >
              <Typography
                variant="h2"
                id="training-overview-heading"
                sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1 }}
              >
                Training Overview
              </Typography>
            </Paper>

            {/* Runner Dashboard: accordion-style week list exposing data-activity-type
                attributes for CSS design token application (enforce-visual-theme feature).
                Rendered as a sibling to training-overview, not inside it, to preserve
                the home-page-structure-step-1 placeholder contract. */}
            <Box data-testid="runner-dashboard-section">
              <RunnerDashboard />
            </Box>

            <Box data-testid="weekly-dashboard">
              <WeeklyDashboard />
            </Box>
          </Box>

          {/* Right Column */}
          <Box
            data-testid="right-column"
            sx={{
              flex: '0 0 50%',
              maxWidth: '50%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Paper
              component="section"
              data-testid="insights"
              role="region"
              aria-labelledby="insights-heading"
              elevation={2}
              sx={{ p: 2 }}
            >
              <Typography
                variant="h2"
                id="insights-heading"
                sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1 }}
              >
                Insights
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </>
  )
}