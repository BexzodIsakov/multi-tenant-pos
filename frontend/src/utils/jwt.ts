export interface DecodedAccessToken {
  sub: string;
  tenantId: string;
  role: 'admin' | 'cashier';
  type: 'access';
  iat: number;
  exp: number;
}

export function decodeAccessToken(token: string): DecodedAccessToken {
  const payload = token.split('.')[1];
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}
