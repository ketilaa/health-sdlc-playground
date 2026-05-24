'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container maxWidth="lg" sx={{ pt: 8, pb: 6 }}>
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" component="h3" gutterBottom>
          We couldn&apos;t find that page.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          The route you requested doesn&apos;t exist yet.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          href="/"
          autoFocus
        >
          Back to home
        </Button>
      </Box>
    </Container>
  );
}