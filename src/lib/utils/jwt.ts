import { SignJWT, jwtVerify, JWTVerifyResult } from 'jose';

const getSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET in environment');
  return new TextEncoder().encode(secret);
};

export type JWTPayload = Record<string, unknown> & { exp?: number; iat?: number };

export interface SignOptions {
  /** 有効期限。'15m' や秒数 (number) を指定可能。デフォルトは '15m' */
  expiresIn?: string | number;
}

export async function signJwt(payload: JWTPayload, options: SignOptions = {}): Promise<string> {
  const secret = getSecret();
  const jwt = new SignJWT(payload as Record<string, unknown>);
  jwt.setProtectedHeader({ alg: 'HS256' }).setIssuedAt();

  if (options.expiresIn) {
    jwt.setExpirationTime(options.expiresIn as any);
  } else {
    jwt.setExpirationTime('15m');
  }

  return await jwt.sign(secret);
}

export async function verifyJwt<T extends JWTPayload = JWTPayload>(token: string): Promise<T> {
  const secret = getSecret();
  const result: JWTVerifyResult = await jwtVerify(token, secret, { algorithms: ['HS256'] });
  return result.payload as unknown as T;
}

export function decodeJwt(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload as JWTPayload;
  } catch (e) {
    return null;
  }
}

export async function isJwtValid(token: string): Promise<boolean> {
  try {
    await verifyJwt(token);
    return true;
  } catch {
    return false;
  }
}

export default { signJwt, verifyJwt, decodeJwt, isJwtValid };
