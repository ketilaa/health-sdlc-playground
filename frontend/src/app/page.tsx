import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppHeader from '@/components/AppHeader';

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 2,
          py: 8,
          maxWidth: 960,
          mx: 'auto',
        }}
      >
        <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
          Welcome to the Playground
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Pick a dataset and start exploring health data.
        </Typography>
      </Box>
    </>
  );
}