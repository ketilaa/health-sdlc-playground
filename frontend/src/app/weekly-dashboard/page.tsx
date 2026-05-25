// Static export does not support the navigation helper from next/navigation —
// calling it during static generation throws "Redirect cannot be used in static
// rendering". The /weekly-dashboard → / redirect is handled entirely by
// serve.json (HTTP 308) for the npx-serve deployment.
// This file must exist so Next.js does not emit a 404 page for the route at
// build time, but it renders nothing and contains no navigation calls.
export default function WeeklyDashboardPage() {
  return null
}