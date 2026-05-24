'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const Hero: React.FC = () => {
  return (
    <Box
      sx={{
        pt: { xs: 6, md: 12 },
        px: { xs: 2, sm: 3 },
        maxWidth: 960,
        mx: 'auto',
        textAlign: 'left',
      }}
    >
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: '2.25rem', md: '3.5rem' },
          fontWeight: 700,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(90deg, #0FB5A3 0%, #5B5BD6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          mb: 2,
        }}
      >
        Health Playground
      </Typography>
      <Typography
        component="p"
        sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, color: '#3a3a44' }}
      >
        A space to explore health datasets.
      </Typography>
    </Box>
  );
};