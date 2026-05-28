'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { WeeklyDashboard } from './WeeklyDashboard'
import RunnerDashboard from './RunnerDashboard'

// Inline SVG: hamburger menu icon (three horizontal lines)
function HamburgerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', color: 'var(--color-text-primary, inherit)' }}
    >
      <rect x="3" y="5" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="3" y="17" width="18" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

// Inline SVG: home icon (house outline)
function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0, color: 'var(--color-text-muted, inherit)' }}
    >
      <path
        d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function HomePage() {
  const [dataset, setDataset] = useState('demo')
  const [isNavOpen, setIsNavOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const closeMenu = useCallback(() => {
    setIsNavOpen(false)
    // Return focus to trigger on close
    triggerRef.current?.focus()
  }, [])

  const toggleMenu = useCallback(() => {
    setIsNavOpen((prev) => !prev)
  }, [])

  // Close menu on Escape key or click outside
  useEffect(() => {
    if (!isNavOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        closeMenu()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNavOpen, closeMenu])

  const handleHomeClick = useCallback(() => {
    setIsNavOpen(false)
    router.push('/')
  }, [router])

  return (
    <>
      <AppBar position="sticky" elevation={4} component="header">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Left side: nav trigger + title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Navigation Menu Trigger */}
            <button
              ref={triggerRef}
              data-testid="nav-menu-trigger"
              aria-label={isNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isNavOpen}
              aria-controls="nav-menu"
              onClick={toggleMenu}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                minWidth: 40,
                background: 'transparent',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                padding: 0,
                color: 'inherit',
                outline: 'none',
              }}
            >
              <HamburgerIcon />
            </button>

            <Typography
              variant="h6"
              component="h1"
              sx={{ fontWeight: 700 }}
            >
              Health Playground
            </Typography>
          </Box>

          <div data-testid="dataset-selector">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel
                id="dataset-selector-label"
                sx={{ color: 'inherit' }}
                htmlFor="dataset-selector-input"
              >
                Dataset
              </InputLabel>
              <Select
                labelId="dataset-selector-label"
                inputProps={{ id: 'dataset-selector-input' }}
                value={dataset}
                label="Dataset"
                onChange={(e) => setDataset(e.target.value)}
                aria-label="Select dataset"
                sx={{ color: 'inherit' }}
              >
                <MenuItem value="demo">Demo Dataset</MenuItem>
              </Select>
            </FormControl>
          </div>
        </Toolbar>
      </AppBar>

      {/* Navigation Menu Panel — conditionally rendered */}
      {isNavOpen && (
        <div
          ref={menuRef}
          data-testid="nav-menu"
          id="nav-menu"
          role="menu"
          aria-label="Main navigation"
          style={{
            position: 'fixed',
            top: 64, // below AppBar
            left: 0,
            zIndex: 1300,
            backgroundColor: 'var(--color-surface, #1e1e2e)',
            border: '1px solid var(--color-border, #3a3a4a)',
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: 180,
            maxWidth: 280,
            paddingTop: 4,
            paddingBottom: 4,
          }}
        >
          {/* Home menu item */}
          <div
            data-testid="nav-menu-item-home"
            role="menuitem"
            tabIndex={0}
            onClick={handleHomeClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleHomeClick()
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: 'var(--color-text-primary, inherit)',
              fontSize: '0.875rem',
            }}
          >
            <HomeIcon />
            <span>Home</span>
          </div>
        </div>
      )}

      <Box
        component="main"
        sx={{ pt: 2, px: 2 }}
      >
        <Box
          data-testid="content-area"
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            alignItems: 'flex-start',
          }}
        >
          {/* Left Column */}
          <Box
            data-testid="left-column"
            sx={{
              flex: '0 0 50%',
              maxWidth: '50%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Paper
              component="section"
              data-testid="training-overview"
              role="region"
              aria-labelledby="training-overview-heading"
              elevation={2}
              sx={{ p: 2 }}
            >
              <Typography
                variant="h2"
                id="training-overview-heading"
                sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1 }}
              >
                Training Overview
              </Typography>
              <RunnerDashboard />
            </Paper>

            <Box data-testid="weekly-dashboard">
              <WeeklyDashboard />
            </Box>
          </Box>

          {/* Right Column */}
          <Box
            data-testid="right-column"
            sx={{
              flex: '0 0 50%',
              maxWidth: '50%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Paper
              component="section"
              data-testid="insights"
              role="region"
              aria-labelledby="insights-heading"
              elevation={2}
              sx={{ p: 2 }}
            >
              <Typography
                variant="h2"
                id="insights-heading"
                sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1 }}
              >
                Insights
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </>
  )
}