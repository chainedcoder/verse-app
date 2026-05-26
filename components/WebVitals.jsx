"use client"

import { useReportWebVitals } from "next/web-vitals"

export function WebVitals() {
  useReportWebVitals(async (metric) => {
    // In development, log to console for debugging
    if (process.env.NODE_ENV === "development") {
      console.debug("[Web Vitals]", metric.name, Math.round(metric.value), metric.rating)
    }

    // Post to our analytics endpoint in all environments
    try {
      await fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
          navigationType: metric.navigationType,
        }),
        keepalive: true,
      })
    } catch {
      // Silently fail — analytics must never break UX
    }
  })

  return null
}
