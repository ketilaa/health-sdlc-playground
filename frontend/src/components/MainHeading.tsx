'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';

type Props = {
  children: React.ReactNode;
};

export default function MainHeading({ children }: Props) {
  const ref = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <Typography
      variant="h3"
      component="h1"
      ref={ref}
      tabIndex={-1}
      sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, outline: 'none' }}
    >
      {children}
    </Typography>
  );
}