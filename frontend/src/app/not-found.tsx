import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';

export default function NotFound() {
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
      <Typography
        aria-hidden="true"
        sx={{ fontSize: { xs: 80, md: 120 }, fontWeight: 700, lineHeight: 1 }}
      >
        404
      </Typography>
      <Typography variant="h2" component="h2" tabIndex={-1} sx={{ mt: 2 }}>
        Page not found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        The page you were looking for doesn&apos;t exist.
      </Typography>
      <Button variant="contained" component={Link} href="/">
        Go home
      </Button>
    </Box>
  );
}