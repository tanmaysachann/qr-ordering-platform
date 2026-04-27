import { createHash, timingSafeEqual } from "crypto";

const PHONEPE_BASE_URL = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";
const GLOBAL_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "";
const GLOBAL_SALT_KEY = process.env.PHONEPE_SALT_KEY || "";
const GLOBAL_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

export interface PhonePeCredentials {
  merchantId: string;
  saltKey: string;
  saltIndex?: string;
}

function resolveCredentials(override?: PhonePeCredentials): Required<PhonePeCredentials> {
  return {
    merchantId: override?.merchantId || GLOBAL_MERCHANT_ID,
    saltKey: override?.saltKey || GLOBAL_SALT_KEY,
    saltIndex: override?.saltIndex || GLOBAL_SALT_INDEX,
  };
}

interface InitiatePaymentParams {
  merchantTransactionId: string;
  amount: number; // in paise
  redirectUrl: string;
  callbackUrl: string;
  customerPhone?: string;
  credentials?: PhonePeCredentials;
}

interface PhonePePayResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

export async function initiatePayment(
  params: InitiatePaymentParams
): Promise<PhonePePayResponse> {
  const creds = resolveCredentials(params.credentials);

  const payload = {
    merchantId: creds.merchantId,
    merchantTransactionId: params.merchantTransactionId,
    merchantUserId: `CUST-${params.merchantTransactionId.slice(0, 12)}`,
    amount: params.amount,
    redirectUrl: params.redirectUrl,
    redirectMode: "REDIRECT",
    callbackUrl: params.callbackUrl,
    paymentInstrument: {
      type: "PAY_PAGE",
    },
    ...(params.customerPhone && {
      mobileNumber: params.customerPhone,
    }),
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const checksum = generateChecksum(base64Payload, "/pg/v1/pay", creds.saltKey, creds.saltIndex);

  try {
    const response = await fetch(`${PHONEPE_BASE_URL}/pg/v1/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json();

    if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
      return {
        success: true,
        redirectUrl: data.data.instrumentResponse.redirectInfo.url,
      };
    }

    return { success: false, error: data.message || "Payment initiation failed" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment initiation failed",
    };
  }
}

export async function checkPaymentStatus(
  merchantTransactionId: string,
  credentials?: PhonePeCredentials
): Promise<{ success: boolean; status: string; data?: Record<string, unknown> }> {
  const creds = resolveCredentials(credentials);
  const path = `/pg/v1/status/${creds.merchantId}/${merchantTransactionId}`;
  const checksum = generateChecksum("", path, creds.saltKey, creds.saltIndex);

  try {
    const response = await fetch(`${PHONEPE_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": creds.merchantId,
      },
    });

    const data = await response.json();
    return {
      success: data.success,
      status: data.code,
      data,
    };
  } catch {
    return { success: false, status: "INTERNAL_ERROR" };
  }
}

export function verifyWebhookSignature(
  responseBody: string,
  xVerifyHeader: string,
  saltKey?: string,
  saltIndex?: string
): boolean {
  if (typeof responseBody !== "string" || typeof xVerifyHeader !== "string") return false;
  const key = saltKey || GLOBAL_SALT_KEY;
  const index = saltIndex || GLOBAL_SALT_INDEX;
  if (!key) return false;

  const expectedChecksum =
    createHash("sha256")
      .update(responseBody + key)
      .digest("hex") +
    "###" +
    index;

  // Constant-time comparison to prevent timing attacks against the salt key.
  const a = Buffer.from(expectedChecksum, "utf8");
  const b = Buffer.from(xVerifyHeader, "utf8");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function generateChecksum(
  base64Payload: string,
  apiEndpoint: string,
  saltKey: string,
  saltIndex: string
): string {
  const stringToHash = base64Payload + apiEndpoint + saltKey;
  return (
    createHash("sha256").update(stringToHash).digest("hex") +
    "###" +
    saltIndex
  );
}
