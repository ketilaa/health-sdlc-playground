import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MainHeading from '@/components/MainHeading';

export default function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 }, pb: 6, position: 'relative' }}>
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: 40,
          right: 40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          opacity: 0.08,
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      />
      <MainHeading>Welcome to Health Playground.</MainHeading>
      <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
        An exploratory space for health data.
      </Typography>
    </Container>
  );
}