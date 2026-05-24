'use client';
import { createTheme } from '@mui/material/styles';
import { teal } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: { main: teal[700] },
    secondary: { main: '#FF8A65' },
    background: { default: '#FAFAF7' }
  },
  typography: {
    h6: { fontWeight: 600, letterSpacing: '-0.01em' }
  }
});

export default theme;