'use client'

import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6', // blue-500
      dark: '#2563eb', // blue-600
    },
    background: {
      paper: '#f8fafc', // slate-50
    },
    text: {
      secondary: '#64748b', // slate-500
      disabled: '#94a3b8', // slate-400
    },
    action: {
      selected: '#e2e8f0', // slate-200
    },
    divider: '#cbd5e1', // slate-300
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#f1f5f9', // slate-100
        },
      },
    },
  },
})
