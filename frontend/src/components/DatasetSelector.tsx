'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export const DatasetSelector: React.FC = () => {
  return (
    <Tooltip title="Dataset selection coming soon" arrow>
      <Box
        component="button"
        type="button"
        data-testid="dataset-selector"
        aria-label="Dataset selector (coming soon)"
        aria-disabled="true"
        tabIndex={0}
        onClick={(e) => e.preventDefault()}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5,
          py: 0.75,
          borderRadius: 1,
          border: '1px solid rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.85)',
          cursor: 'not-allowed',
          fontFamily: 'inherit',
          fontSize: '0.875rem',
          '&:hover': { background: 'rgba(255,255,255,0.18)' },
          '&:focus-visible': { outline: '2px solid #FAFAF7', outlineOffset: 2 },
        }}
      >
        <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
          Select dataset
        </Typography>
        <KeyboardArrowDownIcon fontSize="small" aria-hidden="true" />
      </Box>
    </Tooltip>
  );
};