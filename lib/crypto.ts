/**
 * lib/crypto.ts
 *
 * Application-layer AES-256-GCM encryption.
 *
 * Current mode  : key derived via HKDF from ENCRYPTION_KEY env var (32-byte hex).
 * Future KMS mode: swap deriveOrgKey() to unwrap a DEK from the encryption_keys
 *                  table using your KMS provider. All encrypt/decrypt call-sites stay unchanged.
 *
 * Required env var:
 *   ENCRYPTION_KEY=<64 hex chars>   # generate with: openssl rand -hex 32
 */

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
} from "crypto";

const ALGO       = "aes-256-gcm";
const IV_LEN     = 12; // 96-bit nonce (GCM best practice)
const TAG_LEN    = 16; // 128-bit auth tag
const KEY_LEN    = 32; // AES-256

function masterKey(): Buffer {
  const k = process.env.ENCRYPTION_KEY;
  if (!k || k.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be set to exactly 64 hex characters. Run: openssl rand -hex 32");
  }
  return Buffer.from(k, "hex");
}

/**
 * Derives a 256-bit per-org key using HKDF-SHA256.
 * When KMS is available, replace this with a KMS unwrap call.
 */
export function deriveOrgKey(orgId: string): Buffer {
  return Buffer.from(
    hkdfSync("sha256", masterKey(), "", `therapy-desk-v1:${orgId}`, KEY_LEN)
  );
}

/**
 * Encrypts plaintext to a colon-delimited base64 string: iv:ciphertext:authTag
 */
export function encrypt(plaintext: string, orgId: string): string {
  const key = deriveOrgKey(orgId);
  const iv  = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv, { authTagLength: TAG_LEN });
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [iv.toString("base64"), enc.toString("base64"), cipher.getAuthTag().toString("base64")].join(":");
}

/**
 * Decrypts a string produced by encrypt().
 */
export function decrypt(ciphertext: string, orgId: string): string {
  const [ivB64, encB64, tagB64] = ciphertext.split(":");
  if (!ivB64 || !encB64 || !tagB64) throw new Error("Invalid ciphertext format");
  const key     = deriveOrgKey(orgId);
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64"), { authTagLength: TAG_LEN });
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encB64, "base64")), decipher.final()]).toString("utf8");
}

/** Nullable-safe encrypt */
export function encryptNullable(value: string | null | undefined, orgId: string): string | null {
  return value == null ? null : encrypt(value, orgId);
}

/** Nullable-safe decrypt */
export function decryptNullable(value: string | null | undefined, orgId: string): string | null {
  return value == null ? null : decrypt(value, orgId);
}

/**
 * HMAC-SHA256 for deterministic searchable hashing (e.g. client search_hash).
 * Uses the org-derived key so hashes are org-scoped.
 */
export function hmacHash(value: string, orgId: string): string {
  return createHmac("sha256", deriveOrgKey(orgId)).update(value).digest("hex");
}

/**
 * Builds the client search_hash from firstName + lastName + dateOfBirth.
 */
export function clientSearchHash(firstName: string, lastName: string, dob: string, orgId: string): string {
  return hmacHash(`${firstName.toLowerCase()}|${lastName.toLowerCase()}|${dob}`, orgId);
}
