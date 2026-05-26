export async function POST(request) {
  try {
    const errorReport = await request.json()

    // Log server-side for visibility
    console.error("[client-error]", {
      message: errorReport.message,
      stack: errorReport.stack,
      url: errorReport.url,
      timestamp: errorReport.timestamp,
    })

    // Forward to Sentry if DSN is configured
    if (process.env.SENTRY_DSN) {
      // Sentry SDK would be initialised here; this is the scaffold
      console.info("[sentry] Would forward error to Sentry:", errorReport.message)
    }

    return new Response(null, { status: 204 })
  } catch {
    return new Response(null, { status: 400 })
  }
}
