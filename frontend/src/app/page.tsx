import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ pt: 8, pb: 6 }}>
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h3" component="h2" gutterBottom>
          Welcome to Health Playground
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A space to explore health datasets. Pick a dataset from the top bar
          once one is available.
        </Typography>
      </Box>
    </Container>
  );
}