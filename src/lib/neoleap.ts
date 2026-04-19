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
