import { createHash, randomBytes, createCipheriv, createDecipheriv, pbkdf2 } from 'crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(pbkdf2);

export async function hashPassword(
  password: string,
  salt?: string
): Promise<{ hash: string; salt: string }> {
  const actualSalt = salt || randomBytes(16).toString('hex');
  const hash = await pbkdf2Async(password, actualSalt, 100000, 64, 'sha512');
  
  return {
    hash: hash.toString('hex'),
    salt: actualSalt,
  };
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string
): Promise<boolean> {
  const { hash: newHash } = await hashPassword(password, salt);
  return newHash === hash;
}

export function hashString(input: string, algorithm: 'sha256' | 'sha512' = 'sha256'): string {
  return createHash(algorithm).update(input).digest('hex');
}

export function md5(input: string): string {
  return createHash('md5').update(input).digest('hex');
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

export function encrypt(text: string, secretKey: string): EncryptedData {
  const key = createHash('sha256').update(secretKey).digest();
  const iv = randomBytes(16);
  
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

export function decrypt(encryptedData: EncryptedData, secretKey: string): string | null {
  try {
    const key = createHash('sha256').update(secretKey).digest();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch {
    return null;
  }
}

export function generateRandomString(length: number = 32): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

export function generateUUID(): string {
  return randomBytes(16).toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}
