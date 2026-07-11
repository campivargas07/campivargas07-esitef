import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";

/**
 * Verify WordPress password hashes during progressive migration.
 * Supports: $wp$ (WP 6.8+), $P$ (phpass), legacy MD5 (32 hex), plaintext (bad WP data).
 */
export function verifyWordPressPassword(
  password: string,
  hash: string
): boolean {
  if (!password || !hash) return false;

  if (hash.length === 32 && /^[a-f0-9]{32}$/i.test(hash)) {
    const md5 = createHash("md5").update(password).digest("hex");
    return safeEqual(md5, hash.toLowerCase());
  }

  if (hash.startsWith("$wp$")) {
    const toVerify = createHmac("sha384", "wp-sha384")
      .update(password.trim(), "utf8")
      .digest("base64");
    return bcrypt.compareSync(toVerify, hash.slice(3));
  }

  if (hash.startsWith("$P$") || hash.startsWith("$H$")) {
    return checkPhpass(password, hash);
  }

  if (hash.startsWith("$2")) {
    return bcrypt.compareSync(password, hash);
  }

  // ponytail: algunos user_pass en WP están en texto plano — solo migración
  if (!hash.startsWith("$") && hash.length < 80) {
    return safeEqual(password, hash);
  }

  return bcrypt.compareSync(password, hash);
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Portable PHP password hashing (phpass) — WordPress legacy */
function checkPhpass(password: string, setting: string): boolean {
  if (setting.length < 12) return false;
  const countLog2 = itoa64Index(setting[3]);
  if (countLog2 < 7 || countLog2 > 30) return false;

  const count = 1 << countLog2;
  const salt = setting.slice(4, 12);
  let hash = md5Buffer(salt + password);
  for (let i = 0; i < count; i++) {
    hash = md5Buffer(Buffer.concat([hash, Buffer.from(password)]));
  }
  const encoded = encode64(hash, 16);
  const output = setting.slice(0, 12) + encoded;
  return safeEqual(output, setting);
}

function md5Buffer(input: string | Buffer): Buffer {
  return Buffer.from(createHash("md5").update(input).digest("binary"), "binary");
}

const ITOA64 =
  "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function itoa64Index(ch: string): number {
  return ITOA64.indexOf(ch);
}

function encode64(input: Buffer, count: number): string {
  let output = "";
  let i = 0;
  do {
    let value = input[i++];
    output += ITOA64[value & 0x3f];
    if (i < count) value |= input[i] << 8;
    output += ITOA64[(value >> 6) & 0x3f];
    if (i++ >= count) break;
    if (i < count) value |= input[i] << 16;
    output += ITOA64[(value >> 12) & 0x3f];
    if (i++ >= count) break;
    output += ITOA64[(value >> 18) & 0x3f];
  } while (i < count);
  return output;
}

export async function hashPasswordModern(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
