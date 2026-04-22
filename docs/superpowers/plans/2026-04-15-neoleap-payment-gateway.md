# Neoleap Payment Gateway Integration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add online card payment (Neoleap/Al Rajhi Bank) to nick.sa booking flow using Bank Hosted integration.

**Architecture:** Customer selects "Pay Online" → server creates booking (status: pending_payment) → encrypts payment data with AES-256-CBC → calls Neoleap API → gets payment page URL → redirects customer to Neoleap's secure page → customer enters card + 3DS → Neoleap redirects back to callback URL → server decrypts response → updates booking status → shows result page.

**Tech Stack:** Next.js 16 API Routes, Node.js crypto (AES-256-CBC), Supabase, Neoleap REST API

---

## File Structure

| File | Purpose |
|------|---------|
| `src/lib/neoleap.ts` | AES encrypt/decrypt + Neoleap API helper |
| `src/app/api/payment/initiate/route.ts` | Create booking + call Neoleap → return payment URL |
| `src/app/api/payment/callback/route.ts` | Handle Neoleap redirect, decrypt, update booking |
| `src/app/payment/result/page.tsx` | Success/failure page shown to customer |
| `src/components/Booking.tsx` | Add "Pay Online" button between cash and BNPL |
| `.env.local` | Add Neoleap credentials |
| `src/i18n/en.ts` | Add payment-related translation keys |
| `src/i18n/ar.ts` | Add payment-related translation keys (Arabic) |

---

### Task 1: Environment Variables

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add Neoleap credentials to .env.local**

```
NEOLEAP_TRANPORTAL_ID=tTILn5j4I3tiU14
NEOLEAP_TRANPORTAL_PASSWORD=!@27SwnTn8#iYR6
NEOLEAP_RESOURCE_KEY=61034089321161034089321161034089
NEOLEAP_TERMINAL_ID=PG376100
NEOLEAP_MERCHANT_ID=600003053
NEOLEAP_API_URL=https://securepayments.neoleap.com.sa/pg/payment/hosted.htm
NEXT_PUBLIC_SITE_URL=https://nick.sa
```

---

### Task 2: Neoleap Crypto Library

**Files:**
- Create: `src/lib/neoleap.ts`

- [ ] **Step 1: Create src/lib/neoleap.ts**

```typescript
import crypto from "crypto";

const IV = "PGKEYENCDECIVSPC"; // Fixed IV per Neoleap docs
const ALGORITHM = "aes-256-cbc";

function getResourceKey(): string {
  const key = process.env.NEOLEAP_RESOURCE_KEY;
  if (!key || key.length !== 32) throw new Error("NEOLEAP_RESOURCE_KEY must be 32 characters");
  return key;
}

/** Encrypt plain trandata JSON string → hex string */
export function encryptTrandata(plainJson: string): string {
  const key = getResourceKey();
  const encoded = encodeURIComponent(plainJson);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, "utf8"), Buffer.from(IV, "utf8"));
  cipher.setAutoPadding(true); // PKCS7
  const encrypted = Buffer.concat([cipher.update(encoded, "utf8"), cipher.final()]);
  return encrypted.toString("hex");
}

/** Decrypt hex string → plain trandata JSON string */
export function decryptTrandata(hexString: string): string {
  const key = getResourceKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key, "utf8"), Buffer.from(IV, "utf8"));
  decipher.setAutoPadding(true);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(hexString, "hex")), decipher.final()]);
  return decodeURIComponent(decrypted.toString("utf8"));
}

interface NeoleapInitResponse {
  status: string;
  result: string | null;
  error: string | null;
  errorText: string | null;
}

interface InitiatePaymentParams {
  amount: number;
  trackId: string;
  customerIp: string;
  locale: string;
  responseURL: string;
  errorURL: string;
}

/** Call Neoleap Payment Token Generation API → returns paymentId + paymentPageUrl */
export async function initiatePayment(params: InitiatePaymentParams): Promise<{
  paymentId: string;
  paymentUrl: string;
}> {
  const tranportalId = process.env.NEOLEAP_TRANPORTAL_ID!;
  const tranportalPassword = process.env.NEOLEAP_TRANPORTAL_PASSWORD!;
  const apiUrl = process.env.NEOLEAP_API_URL!;

  const plainTrandata = JSON.stringify([{
    amt: params.amount.toFixed(2),
    action: "1", // Purchase
    password: tranportalPassword,
    id: tranportalId,
    currencyCode: "682", // SAR
    trackId: params.trackId,
    responseURL: params.responseURL,
    errorURL: params.errorURL,
    udf1: params.trackId, // booking ID for reference
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: "",
    langid: params.locale === "ar" ? "ar" : "",
  }]);

  const encryptedTrandata = encryptTrandata(plainTrandata);

  const requestBody = JSON.stringify([{
    id: tranportalId,
    trandata: encryptedTrandata,
    responseURL: params.responseURL,
    errorURL: params.errorURL,
  }]);

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-FORWARDED-FOR": params.customerIp,
    },
    body: requestBody,
  });

  const text = await res.text();
  let data: NeoleapInitResponse[];
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Neoleap returned invalid JSON: ${text.substring(0, 200)}`);
  }

  const response = data[0];
  if (!response || response.status !== "1" || !response.result) {
    throw new Error(`Neoleap error: ${response?.error || "unknown"} - ${response?.errorText || text.substring(0, 200)}`);
  }

  // result format: "PaymentID:PaymentPageURL"
  const [paymentId, paymentPageUrl] = response.result.split(":");
  const fullUrl = response.result.substring(paymentId.length + 1); // URL may contain colons

  return {
    paymentId,
    paymentUrl: `${fullUrl}?PaymentID=${paymentId}`,
  };
}

export interface NeoleapPaymentResult {
  paymentId: string;
  result: string; // "CAPTURED" = success
  transId: string;
  ref: string;
  trackId: string;
  amt: string;
  authRespCode: string;
  authCode: string;
  cardType: string;
  actionCode: string;
  card?: string;
  udf1?: string;
  error?: string;
  errorText?: string;
}

/** Parse and decrypt the callback response from Neoleap */
export function parseCallbackResponse(params: URLSearchParams): NeoleapPaymentResult {
  const trandata = params.get("trandata");
  const error = params.get("error");
  const errorText = params.get("errorText");
  const paymentId = params.get("paymentId") || "";

  if (error && error.length > 0) {
    return {
      paymentId,
      result: "FAILED",
      transId: "",
      ref: "",
      trackId: "",
      amt: "",
      authRespCode: "",
      authCode: "",
      cardType: "",
      actionCode: "",
      error,
      errorText: errorText || undefined,
    };
  }

  if (!trandata) {
    throw new Error("No trandata in callback response");
  }

  const decrypted = decryptTrandata(trandata);
  let parsed: NeoleapPaymentResult[];
  try {
    parsed = JSON.parse(decrypted);
  } catch {
    throw new Error(`Failed to parse decrypted trandata: ${decrypted.substring(0, 200)}`);
  }

  return parsed[0];
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd C:/Users/acer/nick && npx tsc --noEmit src/lib/neoleap.ts` or just `npm run build` later.

---

### Task 3: Payment Initiate API Route

**Files:**
- Create: `src/app/api/payment/initiate/route.ts`

- [ ] **Step 1: Create the initiate route**

This route receives the full booking data, creates the booking with status "pending_payment", then calls Neoleap to get a payment URL.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { initiatePayment } from "@/lib/neoleap";
import crypto from "crypto";

function generateConfirmationNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) code += chars[bytes[i] % chars.length];
  return `NK-${code}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name, customer_phone, customer_notes,
      car_make, car_year, car_color, preferred_date,
      car_size, package_id, service_ids, addon_ids,
      subtotal, discount, total, locale,
    } = body;

    if (!customer_name || !customer_phone || !car_size || !car_make || !preferred_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });
    }

    const confirmation_number = generateConfirmationNumber();

    // Insert booking with pending_payment status
    const { data: booking, error: dbError } = await supabase
      .from("nick_bookings")
      .insert({
        customer_name,
        customer_phone,
        customer_notes: customer_notes || null,
        car_make: car_make || null,
        car_year: car_year || null,
        car_color: car_color || null,
        preferred_date: preferred_date || null,
        car_size,
        package_id: package_id || null,
        service_ids: service_ids || [],
        addon_ids: addon_ids || {},
        subtotal,
        discount: discount || 0,
        total,
        payment_method: "online",
        locale: locale || "en",
        confirmation_number,
        status: "pending_payment",
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Build callback URLs
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nick.sa";
    const callbackUrl = `${siteUrl}/api/payment/callback`;

    const customerIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip") || "127.0.0.1";

    const { paymentUrl } = await initiatePayment({
      amount: total,
      trackId: booking.id,
      customerIp,
      locale: locale || "en",
      responseURL: callbackUrl,
      errorURL: callbackUrl,
    });

    // Store payment URL reference (optional: could store paymentId too)
    return NextResponse.json({
      paymentUrl,
      bookingId: booking.id,
      confirmation_number,
    }, { status: 201 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment initiation failed";
    console.error("[PAYMENT] Initiation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

---

### Task 4: Payment Callback API Route

**Files:**
- Create: `src/app/api/payment/callback/route.ts`

- [ ] **Step 1: Create the callback route**

Neoleap redirects the customer back here (as GET with query params or POST with form data). We decrypt the response and redirect to the result page.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { parseCallbackResponse } from "@/lib/neoleap";

async function handleCallback(params: URLSearchParams): Promise<NextResponse> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nick.sa";

  try {
    const result = parseCallbackResponse(params);
    const bookingId = result.trackId || result.udf1 || "";
    const isSuccess = result.result === "CAPTURED";

    if (bookingId) {
      // Update booking status
      const updateData: Record<string, unknown> = {
        status: isSuccess ? "confirmed" : "payment_failed",
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from("nick_bookings")
        .update(updateData)
        .eq("id", bookingId);

      // Get confirmation number for redirect
      const { data: booking } = await supabase
        .from("nick_bookings")
        .select("confirmation_number, locale")
        .eq("id", bookingId)
        .single();

      const cn = booking?.confirmation_number || "";
      const locale = booking?.locale || "en";

      if (isSuccess) {
        return NextResponse.redirect(
          `${siteUrl}/payment/result?status=success&cn=${cn}&lang=${locale}`
        );
      } else {
        return NextResponse.redirect(
          `${siteUrl}/payment/result?status=failed&cn=${cn}&lang=${locale}&error=${encodeURIComponent(result.error || result.result)}`
        );
      }
    }

    return NextResponse.redirect(`${siteUrl}/payment/result?status=failed&error=missing_booking`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[PAYMENT] Callback error:", msg);
    return NextResponse.redirect(
      `${siteUrl}/payment/result?status=failed&error=${encodeURIComponent(msg)}`
    );
  }
}

// Neoleap may redirect via GET (URL params) or POST (form body)
export async function GET(req: NextRequest) {
  return handleCallback(req.nextUrl.searchParams);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params = new URLSearchParams();
  formData.forEach((value, key) => params.set(key, value.toString()));
  return handleCallback(params);
}
```

---

### Task 5: Payment Result Page

**Files:**
- Create: `src/app/payment/result/page.tsx`

- [ ] **Step 1: Create the result page**

```typescript
"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function PaymentResult() {
  const params = useSearchParams();
  const status = params.get("status");
  const cn = params.get("cn");
  const error = params.get("error");
  const lang = params.get("lang") || "en";
  const isAr = lang === "ar";
  const isSuccess = status === "success";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#050505", color: "#f5f5f5", fontFamily: "system-ui, sans-serif",
      padding: 24,
    }} dir={isAr ? "rtl" : "ltr"}>
      <div style={{
        maxWidth: 480, width: "100%", textAlign: "center",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20, padding: "48px 32px",
      }}>
        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 24px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isSuccess ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.15)",
        }}>
          {isSuccess ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: isSuccess ? "#4caf50" : "#f44336" }}>
          {isSuccess
            ? (isAr ? "تم الدفع بنجاح" : "Payment Successful")
            : (isAr ? "فشل الدفع" : "Payment Failed")}
        </h1>

        {isSuccess && cn && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 8 }}>
              {isAr ? "رقم التأكيد" : "Confirmation Number"}
            </p>
            <p style={{
              fontSize: 32, fontWeight: 800, color: "#F6BE00", letterSpacing: 2,
              fontFamily: "monospace",
            }}>{cn}</p>
          </div>
        )}

        {!isSuccess && (
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            {isAr
              ? "لم تتم عملية الدفع. يمكنك المحاولة مرة أخرى أو الحجز والدفع في المحل."
              : "Your payment could not be processed. You can try again or book and pay at the shop."}
          </p>
        )}

        {isSuccess && (
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            {isAr
              ? "تم تأكيد حجزك ودفعك بنجاح. سنتواصل معك قريباً."
              : "Your booking is confirmed and payment received. We will contact you soon."}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {!isSuccess && (
            <Link href="/booking" style={{
              display: "block", padding: "14px 24px", borderRadius: 12,
              background: "#F6BE00", color: "#000", fontWeight: 700, fontSize: 15,
              textDecoration: "none", textAlign: "center",
            }}>
              {isAr ? "حاول مرة أخرى" : "Try Again"}
            </Link>
          )}
          <Link href="/" style={{
            display: "block", padding: "14px 24px", borderRadius: 12,
            background: "rgba(255,255,255,0.06)", color: "#f5f5f5", fontWeight: 600, fontSize: 14,
            textDecoration: "none", textAlign: "center",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {isAr ? "الرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#050505" }} />}>
      <PaymentResult />
    </Suspense>
  );
}
```

---

### Task 6: Add "Pay Online" Button to Booking Component

**Files:**
- Modify: `src/components/Booking.tsx` (around lines 1185-1240)
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/ar.ts`

- [ ] **Step 1: Add i18n keys**

In `src/i18n/en.ts`, add inside the `booking` object:
```
payOnline: "Pay Online",
payOnlineProcessing: "Redirecting to payment...",
orPayOnline: "or pay online",
```

In `src/i18n/ar.ts`, add inside the `booking` object:
```
payOnline: "ادفع أونلاين",
payOnlineProcessing: "جاري التحويل للدفع...",
orPayOnline: "أو ادفع أونلاين",
```

- [ ] **Step 2: Add saveBookingOnline function and Pay Online button**

In `Booking.tsx`, add a new function `saveBookingOnline` that:
1. Collects all booking data (same as saveBooking)
2. POSTs to `/api/payment/initiate` instead of `/api/booking`
3. On success, redirects browser to `paymentUrl`

Add a "Pay Online" button between the cash button and the BNPL divider. Style: dark blue/teal background (#0066cc), credit card icon, shows total amount.

---

### Task 7: Test End-to-End

- [ ] **Step 1: Run dev server and test**

```bash
cd C:/Users/acer/nick && npm run dev
```

Test flow:
1. Go to /booking
2. Select car size, services, fill form
3. Click "Pay Online"
4. Should redirect to Neoleap test payment page
5. Use test card: 4012001037141112, 12/27, CVV 123, OTP 123123
6. Should redirect back to /payment/result?status=success

- [ ] **Step 2: Deploy**

```bash
npx vercel --prod
```
