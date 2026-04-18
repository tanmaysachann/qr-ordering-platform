import { createHash } from "crypto";

const PHONEPE_BASE_URL = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

interface InitiatePaymentParams {
  merchantTransactionId: string;
  amount: number; // in paise
  redirectUrl: string;
  callbackUrl: string;
  customerPhone?: string;
}

interface PhonePePayResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

export async function initiatePayment(
  params: InitiatePaymentParams
): Promise<PhonePePayResponse> {
  const payload = {
    merchantId: MERCHANT_ID,
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
  const checksum = generateChecksum(base64Payload, "/pg/v1/pay");

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
  merchantTransactionId: string
): Promise<{ success: boolean; status: string; data?: Record<string, unknown> }> {
  const path = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
  const checksum = generateChecksum("", path);

  try {
    const response = await fetch(`${PHONEPE_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": MERCHANT_ID,
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
  xVerifyHeader: string
): boolean {
  const expectedChecksum =
    createHash("sha256")
      .update(responseBody + SALT_KEY)
      .digest("hex") +
    "###" +
    SALT_INDEX;

  return expectedChecksum === xVerifyHeader;
}

function generateChecksum(base64Payload: string, apiEndpoint: string): string {
  const stringToHash = base64Payload + apiEndpoint + SALT_KEY;
  return (
    createHash("sha256").update(stringToHash).digest("hex") +
    "###" +
    SALT_INDEX
  );
}
