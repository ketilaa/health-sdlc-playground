import { createTheme } from '@mui/material/styles'
import { themeTokens } from './theme/tokens'

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: themeTokens['--color-background'],
      paper: themeTokens['--color-surface'],
    },
    primary: {
      main: themeTokens['--color-activity-long-run'],
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: themeTokens['--color-surface'],
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          // Suppress MUI v5 dark-mode elevation overlay (background-image gradient)
          backgroundImage: 'none',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: { color: 'inherit' },
      },
    },
  },
})
