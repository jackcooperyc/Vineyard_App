type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult =
  | { ok: true; provider: "resend" | "noop" }
  | { ok: false; error: string; provider: "resend" | "noop" };

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim(),
  );
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    console.info(
      "[notifications] Email not configured (RESEND_API_KEY / EMAIL_FROM); skipping send",
      { to: input.to, subject: input.subject },
    );
    return { ok: false, error: "Email not configured", provider: "noop" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        error: `Resend error ${response.status}: ${body}`,
        provider: "resend",
      };
    }

    return { ok: true, provider: "resend" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown send error";
    return { ok: false, error: message, provider: "resend" };
  }
}
