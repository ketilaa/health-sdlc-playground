import { redirect } from 'next/navigation'

// Server-side 308 permanent redirect from /weekly-dashboard to /
// Using Next.js redirect() with 'permanent: true' issues HTTP 308
export default function WeeklyDashboardRedirectPage() {
  redirect('/')
}