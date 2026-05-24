import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export function AppHeader() {
  return (
    <AppBar position="sticky" data-testid="app-header" color="default" elevation={1}>
      <Toolbar>
        <Box
          component="span"
          aria-hidden="true"
          sx={{ display: 'inline-block', width: 24, height: 24, mr: 1 }}
        />
        <Typography
          variant="h6"
          component="h1"
          sx={{ fontWeight: 600, letterSpacing: '0.02em' }}
        >
          Health Playground
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box
          data-testid="dataset-selector-placeholder"
          role="note"
          sx={{
            minWidth: { xs: 100, sm: 140, md: 180 },
            height: 36,
            px: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed',
            borderColor: 'text.disabled',
            borderRadius: 999,
            opacity: 0.6,
            color: 'text.secondary',
            fontSize: '0.875rem',
            cursor: 'default',
            userSelect: 'none',
          }}
        >
          Dataset selector — coming soon
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;