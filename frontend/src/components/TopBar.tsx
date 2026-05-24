'use client';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';

export default function TopBar() {
  return (
    <AppBar
      position="static"
      elevation={2}
      data-testid="top-bar"
      color="primary"
    >
      <Toolbar sx={{ px: 3 }}>
        <Typography
          variant="h6"
          component="h1"
          sx={{ color: 'common.white' }}
        >
          Health Playground
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Dataset selector — coming soon">
          <Skeleton
            data-testid="dataset-selector-placeholder"
            variant="rounded"
            width={180}
            height={36}
            aria-label="Dataset selector placeholder, not yet available"
            tabIndex={-1}
            sx={{
              bgcolor: 'rgba(255, 138, 101, 0.35)',
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none'
              }
            }}
          />
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}