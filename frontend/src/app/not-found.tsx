'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AppHeader from '@/components/AppHeader';

export default function NotFound() {
  const headingRef = React.useRef<HTMLHeadingElement | null>(null);

  React.useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

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
        <Typography
          variant="h1"
          component="div"
          aria-hidden="true"
          sx={{ fontSize: '6rem', fontWeight: 700, color: 'text.disabled' }}
        >
          404
        </Typography>
        <Typography
          variant="h2"
          component="h2"
          ref={headingRef as any}
          tabIndex={-1}
          sx={{ fontSize: '2rem', fontWeight: 600, mt: 2 }}
        >
          Page not found
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          The page you were looking for doesn&apos;t exist.
        </Typography>
        <Button variant="contained" href="/" sx={{ mt: 4 }}>
          Go home
        </Button>
      </Box>
    </>
  );
}