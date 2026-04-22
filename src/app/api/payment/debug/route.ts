import { NextRequest, NextResponse } from "next/server";
import https from "https";

const URL_STR = "https://securepayments.neoleap.com.sa/pg/payment/hosted.htm";

function tryNodeFetch(opts: { keepAlive?: boolean; timeout?: number } = {}) {
  return new Promise<{ ok: boolean; info: string }>((resolve) => {
    const u = new URL(URL_STR);
    const req = https.request(
      {
        hostname: u.hostname,
        port: 443,
        path: u.pathname,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": "2" },
        timeout: opts.timeout ?? 15000,
        agent: new https.Agent({ keepAlive: opts.keepAlive ?? false }),
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c.toString().slice(0, 300)));
        res.on("end", () =>
          resolve({ ok: true, info: `status=${res.statusCode} body=${body.slice(0, 200)}` })
        );
      }
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, info: "TIMEOUT" });
    });
    req.on("error", (e: NodeJS.ErrnoException) => {
      resolve({ ok: false, info: `${e.code || e.name}: ${e.message}` });
    });
    req.write("{}");
    req.end();
  });
}

async function tryFetch() {
  try {
    const res = await fetch(URL_STR, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.text();
    return { ok: true, info: `status=${res.status} body=${body.slice(0, 200)}` };
  } catch (e) {
    const err = e as Error & { cause?: { code?: string; message?: string } };
    return {
      ok: false,
      info: `${err.name}: ${err.message} | cause=${err.cause?.code || ""} ${err.cause?.message || ""}`,
    };
  }
}

async function tryDnsLookup() {
  const dns = await import("dns/promises");
  try {
    const a = await dns.lookup("securepayments.neoleap.com.sa", { all: true });
    return { ok: true, info: JSON.stringify(a) };
  } catch (e) {
    return { ok: false, info: (e as Error).message };
  }
}

export async function GET(_req: NextRequest) {
  const [f, h, dns] = await Promise.all([tryFetch(), tryNodeFetch(), tryDnsLookup()]);
  return NextResponse.json({
    region: process.env.VERCEL_REGION || "unknown",
    node: process.version,
    dns,
    fetch: f,
    nodeHttps: h,
  });
}
