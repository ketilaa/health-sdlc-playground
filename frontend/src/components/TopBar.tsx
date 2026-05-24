import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function TopBar() {
  return (
    <AppBar
      component="header"
      position="static"
      color="default"
      elevation={0}
      data-testid="top-bar"
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, px: { xs: 2, md: 3 } }}>
        <Box
          aria-hidden="true"
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            mr: 1.5,
          }}
        />
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, letterSpacing: '-0.01em', color: 'text.primary' }}
        >
          Health Playground
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Chip
          data-testid="dataset-selector-placeholder"
          label="Dataset"
          icon={<KeyboardArrowDownIcon />}
          aria-label="Dataset selector (coming soon)"
          aria-disabled="true"
          tabIndex={-1}
          sx={{
            opacity: 0.6,
            pointerEvents: 'none',
            '& .MuiChip-icon': { order: 1, ml: -0.5, mr: 0.5 },
          }}
        />
      </Toolbar>
    </AppBar>
  );
}