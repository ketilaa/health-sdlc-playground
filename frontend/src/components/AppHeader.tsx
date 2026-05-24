import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export const APP_TITLE = 'Health Playground';

export default function AppHeader() {
  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={1}
      data-testid="app-header"
    >
      <Toolbar>
        <Box
          aria-hidden="true"
          sx={{
            width: 24,
            height: 24,
            mr: 1,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#ff8a65,#ba68c8)'
          }}
        />
        <Typography
          component="h1"
          variant="h6"
          sx={{ fontWeight: 600, letterSpacing: '0.02em' }}
        >
          {APP_TITLE}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box
          data-testid="dataset-selector-placeholder"
          role="note"
          sx={{
            minWidth: { xs: 100, sm: 140, md: 180 },
            height: 36,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed',
            borderColor: 'text.disabled',
            borderRadius: 999,
            opacity: 0.6,
            cursor: 'default',
            fontSize: 12,
            color: 'text.secondary',
            userSelect: 'none'
          }}
        >
          Dataset selector — coming soon
        </Box>
      </Toolbar>
    </AppBar>
  );
}