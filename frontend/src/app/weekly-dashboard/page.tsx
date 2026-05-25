// Static export does not support redirect() from next/navigation — any call to
// redirect() during static generation throws "Redirect cannot be used in static
// rendering". The /weekly-dashboard → / redirect is handled entirely by
// serve.json (HTTP 308) for the npx-serve deployment.
// This file must exist so Next.js does not emit a 404 page for the route at
// build time, but it renders nothing and contains no redirect() call.
export default function WeeklyDashboardPage() {
  return null
}