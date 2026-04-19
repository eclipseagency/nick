import crypto from "crypto";
import https from "https";

const IV = "PGKEYENCDECIVSPC"; // Fixed IV per Neoleap docs
const ALGORITHM = "aes-256-cbc";

// Neoleap's server sends only the leaf cert (no intermediate). Node rejects the
// TLS handshake without the intermediate. Vendor it inline so the serverless
// bundle ships with it. Intermediate is the public "GlobalSign RSA OV SSL CA
// 2018", issuer of securepayments.neoleap.com.sa. Safe to commit — it's a
// public CA cert, not a secret.
const NEOLEAP_INTERMEDIATE_CA = `-----BEGIN CERTIFICATE-----
MIIETjCCAzagAwIBAgINAe5fIh38YjvUMzqFVzANBgkqhkiG9w0BAQsFADBMMSAw
HgYDVQQLExdHbG9iYWxTaWduIFJvb3QgQ0EgLSBSMzETMBEGA1UEChMKR2xvYmFs
U2lnbjETMBEGA1UEAxMKR2xvYmFsU2lnbjAeFw0xODExMjEwMDAwMDBaFw0yODEx
MjEwMDAwMDBaMFAxCzAJBgNVBAYTAkJFMRkwFwYDVQQKExBHbG9iYWxTaWduIG52
LXNhMSYwJAYDVQQDEx1HbG9iYWxTaWduIFJTQSBPViBTU0wgQ0EgMjAxODCCASIw
DQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKdaydUMGCEAI9WXD+uu3Vxoa2uP
UGATeoHLl+6OimGUSyZ59gSnKvuk2la77qCk8HuKf1UfR5NhDW5xUTolJAgvjOH3
idaSz6+zpz8w7bXfIa7+9UQX/dhj2S/TgVprX9NHsKzyqzskeU8fxy7quRU6fBhM
abO1IFkJXinDY+YuRluqlJBJDrnw9UqhCS98NE3QvADFBlV5Bs6i0BDxSEPouVq1
lVW9MdIbPYa+oewNEtssmSStR8JvA+Z6cLVwzM0nLKWMjsIYPJLJLnNvBhBWk0Cq
o8VS++XFBdZpaFwGue5RieGKDkFNm5KQConpFmvv73W+eka440eKHRwup08CAwEA
AaOCASkwggElMA4GA1UdDwEB/wQEAwIBhjASBgNVHRMBAf8ECDAGAQH/AgEAMB0G
A1UdDgQWBBT473/yzXhnqN5vjySNiPGHAwKz6zAfBgNVHSMEGDAWgBSP8Et/qC5F
JK5NUPpjmove4t0bvDA+BggrBgEFBQcBAQQyMDAwLgYIKwYBBQUHMAGGImh0dHA6
Ly9vY3NwMi5nbG9iYWxzaWduLmNvbS9yb290cjMwNgYDVR0fBC8wLTAroCmgJ4Yl
aHR0cDovL2NybC5nbG9iYWxzaWduLmNvbS9yb290LXIzLmNybDBHBgNVHSAEQDA+
MDwGBFUdIAAwNDAyBggrBgEFBQcCARYmaHR0cHM6Ly93d3cuZ2xvYmFsc2lnbi5j
b20vcmVwb3NpdG9yeS8wDQYJKoZIhvcNAQELBQADggEBAJmQyC1fQorUC2bbmANz
EdSIhlIoU4r7rd/9c446ZwTbw1MUcBQJfMPg+NccmBqixD7b6QDjynCy8SIwIVbb
0615XoFYC20UgDX1b10d65pHBf9ZjQCxQNqQmJYaumxtf4z1s4DfjGRzNpZ5eWl0
6r/4ngGPoJVpjemEuunl1Ig423g7mNA2eymw0lIYkN5SQwCuaifIFJ6GlazhgDEw
fpolu4usBCOmmQDo8dIm7A9+O4orkjgTHY+GzYZSR+Y0fFukAj6KYXwidlNalFMz
hriSqHKvoflShx8xpfywgVcvzfTO3PYkz6fiNJBonf6q8amaEsybwMbDqKWwIX7e
SPY=
-----END CERTIFICATE-----`;

const neoleapAgent = new https.Agent({ ca: NEOLEAP_INTERMEDIATE_CA, keepAlive: false });

function httpsPostJson(urlStr: string, body: string, headers: Record<string, string>, timeoutMs = 20000): Promise<string> {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const req = https.request(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        method: "POST",
        headers: { ...headers, "Content-Length": Buffer.byteLength(body).toString() },
        agent: neoleapAgent,
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      }
    );
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(new Error("Neoleap request timed out")); });
    req.write(body);
    req.end();
  });
}

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

  const text = await httpsPostJson(apiUrl, requestBody, {
    "Content-Type": "application/json",
    "X-FORWARDED-FOR": params.customerIp,
  });
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
  const [paymentId] = response.result.split(":");
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
