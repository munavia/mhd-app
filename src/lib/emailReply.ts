const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidReplyEmail(email: string | undefined | null): boolean {
  if (!email?.trim()) return false;
  return EMAIL_RE.test(email.trim());
}

export function buildMailtoReply(
  to: string,
  subject: string,
  body: string
): string {
  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", body);
  return `mailto:${to.trim()}?${params.toString()}`;
}

/**
 * Gmail web compose. Requires the user to be signed into Google in the browser.
 * @see https://stackoverflow.com/a/10377966
 */
export function buildGmailComposeUrl(
  to: string,
  subject: string,
  body: string
): string {
  const u = new URL("https://mail.google.com/mail/?view=cm&fs=1");
  u.searchParams.set("to", to.trim());
  u.searchParams.set("su", subject);
  u.searchParams.set("body", body);
  return u.toString();
}

export function buildContactReplyBody(
  name: string,
  originalMessage: string
): string {
  return `\n\n---\n${name} wrote (contact form):\n\n${originalMessage}`;
}

export function buildPrayerReplyBody(name: string, request: string): string {
  return `\n\n---\nPrayer request from ${name}:\n\n${request}`;
}
