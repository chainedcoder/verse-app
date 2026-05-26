export async function POST(request) {
  try {
    const metric = await request.json()

    // In production, forward to your analytics backend (e.g. Sentry, Datadog, GA)
    // Example: forward to Google Analytics 4 Measurement Protocol
    if (process.env.GA_MEASUREMENT_ID && process.env.GA_API_SECRET) {
      fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`,
        {
          method: "POST",
          body: JSON.stringify({
            client_id: "web-vitals",
            events: [
              {
                name: "web_vitals",
                params: {
                  metric_name: metric.name,
                  metric_value: Math.round(metric.value),
                  metric_rating: metric.rating,
                  metric_id: metric.id,
                },
              },
            ],
          }),
        }
      ).catch(() => {})
    }

    // Always log server-side for observability
    console.info(
      `[vitals] ${metric.name}=${Math.round(metric.value)} (${metric.rating})`
    )

    return new Response(null, { status: 204 })
  } catch {
    return new Response(null, { status: 400 })
  }
}
