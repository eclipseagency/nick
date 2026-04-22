"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentResult() {
  const sp = useSearchParams();
  const status = sp.get("status"); // "success" | "failed"
  const cn = sp.get("cn"); // confirmation number
  const error = sp.get("error"); // error message
  const lang = sp.get("lang") || "en";
  const isAr = lang === "ar";
  const dir = isAr ? "rtl" : "ltr";

  const isSuccess = status === "success";

  return (
    <div
      dir={dir}
      style={{
        minHeight: "100vh",
        background: "#050505",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: isAr
          ? "'Tajawal', 'Segoe UI', sans-serif"
          : "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "48px 32px",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        {isSuccess ? (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(76,175,80,0.12)",
              border: "2px solid rgba(76,175,80,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4caf50"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(244,67,54,0.12)",
              border: "2px solid rgba(244,67,54,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f44336"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        )}

        {/* Heading */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#f5f5f5",
            margin: "0 0 12px",
            lineHeight: 1.2,
          }}
        >
          {isSuccess
            ? isAr
              ? "تم الدفع بنجاح"
              : "Payment Successful"
            : isAr
              ? "فشل الدفع"
              : "Payment Failed"}
        </h1>

        {/* Confirmation number */}
        {isSuccess && cn && (
          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: 10,
                background: "rgba(246,190,0,0.1)",
                border: "1px solid rgba(246,190,0,0.25)",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 22,
                fontWeight: 700,
                color: "#F6BE00",
                letterSpacing: 2,
              }}
            >
              {cn}
            </span>
          </div>
        )}

        {/* Subtext */}
        {isSuccess ? (
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.5)",
              margin: "0 0 32px",
              lineHeight: 1.6,
            }}
          >
            {isAr
              ? "تم تأكيد حجزك. سنتواصل معك قريبا."
              : "Your booking is confirmed. We'll be in touch shortly."}
          </p>
        ) : (
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.5)",
              margin: "0 0 32px",
              lineHeight: 1.6,
            }}
          >
            {error ||
              (isAr
                ? "حدث خطأ أثناء عملية الدفع. يرجى المحاولة مرة أخرى."
                : "Something went wrong during payment. Please try again.")}
          </p>
        )}

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "center",
          }}
        >
          {!isSuccess && (
            <Link
              href="/booking"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px 32px",
                borderRadius: 12,
                background: "#F6BE00",
                color: "#000",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                transition: "opacity 0.2s",
                width: "100%",
                maxWidth: 280,
              }}
            >
              {isAr ? "حاول مرة أخرى" : "Try Again"}
            </Link>
          )}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 12,
              background: isSuccess
                ? "#F6BE00"
                : "rgba(255,255,255,0.06)",
              border: isSuccess
                ? "none"
                : "1px solid rgba(255,255,255,0.1)",
              color: isSuccess ? "#000" : "rgba(255,255,255,0.6)",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              transition: "opacity 0.2s",
              width: "100%",
              maxWidth: 280,
            }}
          >
            {isAr ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#050505",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid rgba(246,190,0,0.2)",
              borderTopColor: "#F6BE00",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <PaymentResult />
    </Suspense>
  );
}
