import { timingSafeEqual } from "node:crypto";

export function hasAdminAccess(value: string | null | undefined) {
  const expected = process.env.ADMIN_REPORT_SECRET;
  if (!value || !expected) return false;
  const receivedBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length
    && timingSafeEqual(receivedBuffer, expectedBuffer);
}
