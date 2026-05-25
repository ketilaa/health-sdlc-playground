'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// This page permanently redirects to the root route (/).
// The HTTP 308 redirect for server-level enforcement is handled via
// next.config.js redirects (applicable when using next start).
// For static export deployments, this client component performs the redirect.
export default function WeeklyDashboardRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/')
  }, [router])

  return null
}