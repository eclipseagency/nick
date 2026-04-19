"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 16,
            fontFamily: "system-ui, sans-serif",
            background: "#0a0a0a",
            color: "#fff",
            padding: 24,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ opacity: 0.7 }}>
            Our team has been notified. Please try refreshing the page.
          </p>
        </div>
      </body>
    </html>
  );
}
