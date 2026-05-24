'use client';

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { DatasetSelector } from './DatasetSelector';

export const TopBar: React.FC = () => {
  return (
    <AppBar
      component="header"
      role="banner"
      position="sticky"
      elevation={0}
      data-testid="top-bar"
      sx={{
        background: 'linear-gradient(90deg, #0FB5A3 0%, #5B5BD6 100%)',
        color: '#FAFAF7',
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 2, sm: 3 },
          gap: 2,
        }}
      >
        <Box
          aria-label="Health Playground — home"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <FavoriteIcon aria-hidden="true" fontSize="small" />
          <Typography
            component="span"
            variant="h6"
            sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}
          >
            Health Playground
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <DatasetSelector />
      </Toolbar>
    </AppBar>
  );
};