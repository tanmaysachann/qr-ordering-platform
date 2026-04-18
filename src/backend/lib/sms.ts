/**
 * SMS utility for sending order notifications.
 *
 * Currently uses a console-log stub. To enable real SMS:
 * 1. Set SMS_PROVIDER=twilio (or fast2sms, msg91, etc.) in .env
 * 2. Set the provider-specific env vars (TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM)
 * 3. Implement the provider in sendViaTwilio() below.
 */

interface SMSPayload {
  to: string;       // Phone number (Indian 10-digit or with +91)
  message: string;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+${digits}`;
}

export async function sendSMS({ to, message }: SMSPayload): Promise<boolean> {
  const phone = normalizePhone(to);
  const provider = process.env.SMS_PROVIDER;

  if (!provider) {
    console.log(`[SMS Stub] To: ${phone} | Message: ${message}`);
    return true;
  }

  try {
    switch (provider) {
      case "twilio":
        return await sendViaTwilio(phone, message);
      default:
        console.warn(`[SMS] Unknown provider: ${provider}, falling back to stub`);
        console.log(`[SMS Stub] To: ${phone} | Message: ${message}`);
        return true;
    }
  } catch (error) {
    console.error("[SMS] Failed to send:", error);
    return false;
  }
}

async function sendViaTwilio(to: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!accountSid || !authToken || !from) {
    console.error("[SMS] Twilio credentials not configured");
    return false;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
    },
    body: new URLSearchParams({ To: to, From: from, Body: message }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[SMS] Twilio error:", res.status, body);
    return false;
  }

  return true;
}

/** Send "order ready" notification to customer */
export async function notifyOrderReady(
  customerPhone: string,
  orderNumber: string,
  cafeName: string
): Promise<boolean> {
  return sendSMS({
    to: customerPhone,
    message: `Your order #${orderNumber} at ${cafeName} is ready for pickup! 🎉`,
  });
}
