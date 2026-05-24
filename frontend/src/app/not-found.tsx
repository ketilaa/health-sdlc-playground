import * as React from 'react';
import type { Metadata } from 'next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import MainHeading from '@/components/MainHeading';

export const metadata: Metadata = {
  title: 'Page not found — Health Playground',
};

export default function NotFoundPage() {
  return (
    <Container
      maxWidth="md"
      sx={{
        pt: { xs: 6, md: 10 },
        pb: 6,
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <Typography
        aria-hidden="true"
        sx={{
          fontSize: { xs: '8rem', md: '14rem' },
          fontWeight: 800,
          lineHeight: 1,
          color: 'primary.main',
          opacity: 0.15,
          letterSpacing: '-0.05em',
        }}
      >
        404
      </Typography>
      <MainHeading>Page not found.</MainHeading>
      <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button component={Link} href="/" variant="contained">
          Go to home
        </Button>
      </Box>
    </Container>
  );
}