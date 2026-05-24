import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 2
      }}
    >
      <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
        Welcome to the Playground
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Pick a dataset and start exploring health data.
      </Typography>
    </Box>
  );
}