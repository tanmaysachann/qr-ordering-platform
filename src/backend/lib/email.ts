/**
 * Email utility for sending order confirmations.
 *
 * Currently uses a console-log stub. To enable real email delivery:
 * 1. Set EMAIL_PROVIDER=resend (or sendgrid) in .env
 * 2. Set provider-specific env vars
 *    - resend:   RESEND_API_KEY
 *    - sendgrid: SENDGRID_API_KEY
 * 3. Set EMAIL_FROM (e.g. "Brew & Bites <orders@brewandbites.com>") and EMAIL_REPLY_TO
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface OrderItemSummary {
  itemName: string;
  quantity: number;
  itemPricePaise: number;
  subtotalPaise: number;
}

function formatRupees(paise: number): string {
  return (paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: EmailPayload): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER;
  const from = process.env.EMAIL_FROM || "Scan&Pay <onboarding@resend.dev>";
  const replyTo = process.env.EMAIL_REPLY_TO;

  if (!provider) {
    console.log(
      `[Email Stub] To: ${to} | Subject: ${subject}\n--- text ---\n${text}\n--- end ---`
    );
    return true;
  }

  try {
    switch (provider) {
      case "resend":
        return await sendViaResend({ to, from, replyTo, subject, html, text });
      case "sendgrid":
        return await sendViaSendgrid({ to, from, replyTo, subject, html, text });
      default:
        console.warn(`[Email] Unknown provider: ${provider}, falling back to stub`);
        console.log(`[Email Stub] To: ${to} | Subject: ${subject}\n${text}`);
        return true;
    }
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}

interface SendArgs {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

async function sendViaResend(args: SendArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[Email] RESEND_API_KEY not configured");
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: args.from,
      to: [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
      reply_to: args.replyTo,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[Email] Resend error:", res.status, body);
    return false;
  }
  return true;
}

async function sendViaSendgrid(args: SendArgs): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error("[Email] SENDGRID_API_KEY not configured");
    return false;
  }

  const fromMatch = args.from.match(/^(.*?)\s*<(.+?)>\s*$/);
  const fromEmail = fromMatch ? fromMatch[2] : args.from;
  const fromName = fromMatch ? fromMatch[1].trim() : undefined;

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: args.to }] }],
      from: fromName ? { email: fromEmail, name: fromName } : { email: fromEmail },
      reply_to: args.replyTo ? { email: args.replyTo } : undefined,
      subject: args.subject,
      content: [
        { type: "text/plain", value: args.text },
        { type: "text/html", value: args.html },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[Email] SendGrid error:", res.status, body);
    return false;
  }
  return true;
}

/** ─── Order confirmation template ─────────────────────────────── */

export interface OrderConfirmationArgs {
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  orderNumber: string;
  totalPaise: number;
  cafeName: string;
  cafeAddress: string | null;
  cafeSlug: string;
  orderId: string;
  notes: string | null;
  paymentMethod: string | null;
  placedAt: Date;
  items: OrderItemSummary[];
}

function buildConfirmationText(args: OrderConfirmationArgs): string {
  const itemLines = args.items
    .map(
      (i) =>
        `• ${i.itemName} x${i.quantity}: Rs.${formatRupees(i.subtotalPaise)}`
    )
    .join("\n");

  return [
    `Hi ${args.customerName},`,
    ``,
    `Your order at ${args.cafeName} is confirmed!`,
    ``,
    `Order: #${args.orderNumber}`,
    `Placed: ${args.placedAt.toLocaleString("en-IN")}`,
    ``,
    `Items`,
    `-----`,
    itemLines,
    ``,
    `Total: Rs.${formatRupees(args.totalPaise)}`,
    args.paymentMethod ? `Payment: ${args.paymentMethod}` : "",
    args.notes ? `Notes: ${args.notes}` : "",
    ``,
    `Track your order: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${args.cafeSlug}/order/${args.orderId}`,
    ``,
    `Thank you for ordering with us!`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildConfirmationHtml(args: OrderConfirmationArgs): string {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const trackUrl = `${appUrl}/${args.cafeSlug}/order/${args.orderId}`;

  const itemRows = args.items
    .map(
      (i) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee7dd;font-size:14px;color:#1a120d;">
            <div style="font-weight:600;">${escapeHtml(i.itemName)}</div>
            <div style="color:#7c6f64;font-size:12px;margin-top:2px;">
              Rs.${formatRupees(i.itemPricePaise)} &times; ${i.quantity}
            </div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #eee7dd;font-size:14px;color:#1a120d;text-align:right;font-weight:600;vertical-align:top;">
            Rs.${formatRupees(i.subtotalPaise)}
          </td>
        </tr>
      `
    )
    .join("");

  const notesBlock = args.notes
    ? `
      <tr>
        <td colspan="2" style="padding:14px 16px;background:#fdf6ec;border-radius:8px;font-size:13px;color:#7c6f64;">
          <strong style="color:#1a120d;">Notes:</strong> ${escapeHtml(args.notes)}
        </td>
      </tr>
    `
    : "";

  const paymentBlock = args.paymentMethod
    ? `<div style="font-size:12px;color:#7c6f64;margin-top:4px;">Paid via ${escapeHtml(args.paymentMethod)}</div>`
    : "";

  const addressBlock = args.cafeAddress
    ? `<div style="font-size:13px;color:#d4b896;margin-top:2px;">${escapeHtml(args.cafeAddress)}</div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Order confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f6f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1ea;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(26,18,13,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1a120d;padding:28px 28px 24px;">
              <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#f59e0b;font-weight:600;">
                Order Confirmed
              </div>
              <div style="font-size:24px;color:#fafaf5;font-weight:700;margin-top:8px;letter-spacing:-0.01em;">
                ${escapeHtml(args.cafeName)}
              </div>
              ${addressBlock}
            </td>
          </tr>

          <!-- Greeting + order summary -->
          <tr>
            <td style="padding:28px 28px 8px;">
              <div style="font-size:15px;color:#1a120d;line-height:1.5;">
                Hi <strong>${escapeHtml(args.customerName)}</strong>, thanks for ordering with us. We've got your order and payment. Here are the details.
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 28px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ec;border:1px solid #f0e4d1;border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a16207;font-weight:600;">Order Number</div>
                    <div style="font-size:22px;color:#1a120d;font-weight:700;margin-top:2px;font-family:'SF Mono',Menlo,Consolas,monospace;letter-spacing:0.02em;">#${escapeHtml(args.orderNumber)}</div>
                    <div style="font-size:12px;color:#7c6f64;margin-top:6px;">Placed ${escapeHtml(args.placedAt.toLocaleString("en-IN"))}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:24px 28px 0;">
              <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7c6f64;font-weight:600;margin-bottom:6px;">Your Order</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
                <tr>
                  <td style="padding:16px 0 0;font-size:15px;color:#1a120d;font-weight:700;">Total</td>
                  <td style="padding:16px 0 0;font-size:18px;color:#b45309;font-weight:800;text-align:right;">Rs.${formatRupees(args.totalPaise)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:0;text-align:right;">${paymentBlock}</td>
                </tr>
              </table>
            </td>
          </tr>

          ${notesBlock ? `<tr><td style="padding:20px 28px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${notesBlock}</table></td></tr>` : ""}

          <!-- Track button -->
          <tr>
            <td style="padding:28px 28px 8px;text-align:center;">
              <a href="${trackUrl}" style="display:inline-block;background:#b45309;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:999px;letter-spacing:0.01em;">
                Track your order
              </a>
              <div style="font-size:12px;color:#7c6f64;margin-top:12px;">We'll let you know when it's ready for pickup.</div>
            </td>
          </tr>

          <!-- Customer contact echo -->
          <tr>
            <td style="padding:20px 28px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee7dd;">
                <tr>
                  <td style="padding-top:16px;font-size:12px;color:#7c6f64;line-height:1.6;">
                    <strong style="color:#1a120d;">Contact on file:</strong><br>
                    ${escapeHtml(args.customerName)}${args.customerPhone ? " &middot; " + escapeHtml(args.customerPhone) : ""}<br>
                    ${escapeHtml(args.customerEmail)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#faf4ea;padding:18px 28px;text-align:center;font-size:11px;color:#a89788;">
              This email confirms your order placement. If you didn't place this order, please reply to this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function notifyOrderPlacedEmail(
  args: OrderConfirmationArgs
): Promise<boolean> {
  const subject = `Order #${args.orderNumber} confirmed at ${args.cafeName}`;
  return sendEmail({
    to: args.customerEmail,
    subject,
    html: buildConfirmationHtml(args),
    text: buildConfirmationText(args),
  });
}
