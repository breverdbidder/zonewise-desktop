import { describe, it, expect } from 'bun:test'
import * as fs from 'fs'

const secureStoreSource = fs.readFileSync('apps/electron/src/main/lib/secure-store.ts', 'utf-8')

describe('SEC-006: AES-256-GCM Encryption', () => {
  it('uses AES-256-GCM cipher', () => {
    expect(secureStoreSource).toMatch(/aes-256-gcm/)
  })

  it('generates random salt for each encryption', () => {
    expect(secureStoreSource).toMatch(/crypto\.randomBytes\(16\)/)
  })

  it('generates random IV for each encryption', () => {
    expect(secureStoreSource).toMatch(/crypto\.randomBytes\(12\)/)
  })

  it('uses auth tag for integrity verification', () => {
    expect(secureStoreSource).toMatch(/getAuthTag/)
    expect(secureStoreSource).toMatch(/setAuthTag/)
  })

  it('uses scryptSync for key derivation', () => {
    expect(secureStoreSource).toMatch(/crypto\.scryptSync/)
  })

  it('derives 32-byte (256-bit) key', () => {
    expect(secureStoreSource).toMatch(/scryptSync\(.*,\s*salt,\s*32\)/)
  })

  it('stores format as salt(16) + iv(12) + authTag(16) + ciphertext', () => {
    expect(secureStoreSource).toMatch(/salt.*iv.*authTag.*encrypted/s)
    expect(secureStoreSource).toMatch(/Buffer\.concat\(\[salt, iv, authTag, encrypted\]\)/)
  })

  it('attempts AES-GCM decryption first before legacy fallback', () => {
    const decryptMethod = secureStoreSource.match(/private basicDecrypt[\s\S]*?^  \}/m)?.[0] || ''
    const aesIndex = decryptMethod.indexOf('aes-256-gcm')
    const xorIndex = decryptMethod.indexOf('legacyKey')
    expect(aesIndex).toBeGreaterThan(-1)
    expect(xorIndex).toBeGreaterThan(-1)
    expect(aesIndex).toBeLessThan(xorIndex)
  })

  it('preserves legacy XOR decryption for migration only', () => {
    expect(secureStoreSource).toMatch(/getLegacyKey/)
    expect(secureStoreSource).toMatch(/Legacy.*XOR|legacy.*compat|backward compat/i)
  })

  it('uses machine-specific info for key derivation', () => {
    expect(secureStoreSource).toMatch(/process\.env\.USER/)
    expect(secureStoreSource).toMatch(/userData/)
    expect(secureStoreSource).toMatch(/SERVICE_NAME/)
  })

  it('uses Electron safeStorage when available', () => {
    expect(secureStoreSource).toMatch(/safeStorage\.isEncryptionAvailable/)
    expect(secureStoreSource).toMatch(/safeStorage\.encryptString/)
    expect(secureStoreSource).toMatch(/safeStorage\.decryptString/)
  })

  it('defines CredentialKey type for type-safe key access', () => {
    expect(secureStoreSource).toMatch(/type CredentialKey/)
    expect(secureStoreSource).toMatch(/anthropic_api_key/)
  })
})

describe('SEC-006: Secure Store API', () => {
  it('uses singleton pattern', () => {
    expect(secureStoreSource).toMatch(/static getInstance/)
    expect(secureStoreSource).toMatch(/private static instance/)
  })

  it('supports credential CRUD operations', () => {
    expect(secureStoreSource).toMatch(/async setCredential/)
    expect(secureStoreSource).toMatch(/async getCredential/)
    expect(secureStoreSource).toMatch(/async deleteCredential/)
    expect(secureStoreSource).toMatch(/async hasCredential/)
  })

  it('supports migration from environment variables', () => {
    expect(secureStoreSource).toMatch(/async migrateFromEnv/)
  })

  it('clears env vars after migration', () => {
    expect(secureStoreSource).toMatch(/delete process\.env\[envKey\]/)
  })

  it('stores encrypted file in userData directory', () => {
    expect(secureStoreSource).toMatch(/\.zonewise-credentials\.enc/)
  })
})
