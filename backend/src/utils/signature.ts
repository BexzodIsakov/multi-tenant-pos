import crypto from 'crypto';

export function verifySignature(rawBody: Buffer, signatureFromHeader: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(signatureFromHeader);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}
