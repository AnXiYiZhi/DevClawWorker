import { KEY_PREFIX, KEY_SEGMENT_LENGTH, KEY_SEGMENT_CHARS } from "@devclawworker/shared";

export function generateLicenseKey(): string {
  const segments: string[] = [KEY_PREFIX];
  for (let i = 0; i < 3; i++) {
    let segment = "";
    for (let j = 0; j < KEY_SEGMENT_LENGTH; j++) {
      segment += KEY_SEGMENT_CHARS.charAt(
        Math.floor(Math.random() * KEY_SEGMENT_CHARS.length)
      );
    }
    segments.push(segment);
  }
  return segments.join("-");
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
