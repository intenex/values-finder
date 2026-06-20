import "server-only";
import { Resend } from "resend";

// Transactional email via Resend. These helpers never throw: a mail-provider
// hiccup must never block a signup, login, or password reset. Callers fire them
// with `void` so the request is not held open on serverless.

const FROM = process.env.EMAIL_FROM ?? "Deep Mindfulness <noreply@deepmindfulness.io>";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  if (!resend) {
    // No key configured (local dev / CI). Log the link so flows are testable.
    console.info(`[email] ${subject} → ${to}\n${text}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html, text });
  } catch (err) {
    console.error(`[email] failed to send "${subject}" to ${to}:`, err);
  }
}

function layout(heading: string, body: string, cta: { label: string; url: string }): string {
  return `<!doctype html><html><body style="margin:0;background:#faf6f0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#3b352f">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fffdfa;border:1px solid #ece4d8;border-radius:16px;padding:32px">
        <tr><td>
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:600">${heading}</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#6b6258">${body}</p>
          <a href="${cta.url}" style="display:inline-block;background:#a85a3c;color:#fff;text-decoration:none;font-size:15px;font-weight:500;padding:12px 20px;border-radius:10px">${cta.label}</a>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#9a9085">If the button doesn't work, copy and paste this link:<br><span style="word-break:break-all;color:#a85a3c">${cta.url}</span></p>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

export async function sendVerificationEmail(to: string, url: string): Promise<void> {
  await send(
    to,
    "Verify your email · Deep Mindfulness",
    layout(
      "Confirm your email",
      "Thanks for joining Deep Mindfulness. Confirm this address so you can recover your account later. You can keep using the app right away.",
      { label: "Verify email", url },
    ),
    `Verify your email for Deep Mindfulness: ${url}`,
  );
}

export async function sendResetPasswordEmail(to: string, url: string): Promise<void> {
  await send(
    to,
    "Reset your password · Deep Mindfulness",
    layout(
      "Reset your password",
      "We received a request to reset your password. This link expires in an hour. If you didn't ask for this, you can safely ignore this email.",
      { label: "Reset password", url },
    ),
    `Reset your Deep Mindfulness password: ${url}`,
  );
}
