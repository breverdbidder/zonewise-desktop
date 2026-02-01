/**
 * @fileoverview Secure credential storage using OS keychain
 * @module apps/electron/src/main/lib/secure-store
 * @description SEC-003 Fix: Store OAuth secrets in OS keychain instead of environment files
 * 
 * Uses:
 * - macOS: Keychain Services
 * - Windows: Credential Manager
 * - Linux: libsecret (GNOME Keyring / KWallet)
 * 
 * Falls back to encrypted file storage if keychain unavailable
 */

import { safeStorage } from "electron";
import * as fs from "fs";
import * as path from "path";
import { app } from "electron";

// =============================================================================
// CONSTANTS
// =============================================================================

const SERVICE_NAME = "ZoneWise.AI";
const CREDENTIAL_FILE = ".zonewise-credentials.enc";

/**
 * Supported credential keys
 */
export type CredentialKey = 
  | "anthropic_api_key"
  | "google_oauth_client_id"
  | "google_oauth_client_secret"
  | "slack_oauth_client_id"
  | "slack_oauth_client_secret"
  | "microsoft_oauth_client_id"
  | "craft_mcp_token"
  | "supabase_anon_key"
  | "supabase_service_key"
  | "mapbox_token";

// =============================================================================
// SECURE STORE CLASS
// =============================================================================

/**
 * Secure credential storage manager
 * 
 * @example
 * const store = SecureStore.getInstance();
 * await store.setCredential("anthropic_api_key", "sk-ant-...");
 * const key = await store.getCredential("anthropic_api_key");
 */
export class SecureStore {
  private static instance: SecureStore;
  private credentialsPath: string;
  private cache: Map<string, string> = new Map();
  private initialized: boolean = false;

  private constructor() {
    const userDataPath = app.getPath("userData");
    this.credentialsPath = path.join(userDataPath, CREDENTIAL_FILE);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SecureStore {
    if (!SecureStore.instance) {
      SecureStore.instance = new SecureStore();
    }
    return SecureStore.instance;
  }

  /**
   * Initialize the secure store
   * Loads existing credentials from encrypted storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Check if encryption is available
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn(
        "⚠️ Secure storage not available. " +
        "Credentials will be stored with basic encryption."
      );
    }

    // Load existing credentials
    await this.loadCredentials();
    this.initialized = true;
  }

  /**
   * Store a credential securely
   * @param key - Credential identifier
   * @param value - Credential value
   */
  async setCredential(key: CredentialKey, value: string): Promise<void> {
    if (!value) {
      await this.deleteCredential(key);
      return;
    }

    this.cache.set(key, value);
    await this.saveCredentials();
    console.log(`✅ Stored credential: ${key}`);
  }

  /**
   * Retrieve a credential
   * @param key - Credential identifier
   * @returns Credential value or null if not found
   */
  async getCredential(key: CredentialKey): Promise<string | null> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.cache.get(key) || null;
  }

  /**
   * Delete a credential
   * @param key - Credential identifier
   */
  async deleteCredential(key: CredentialKey): Promise<void> {
    this.cache.delete(key);
    await this.saveCredentials();
    console.log(`🗑️ Deleted credential: ${key}`);
  }

  /**
   * Check if a credential exists
   * @param key - Credential identifier
   */
  async hasCredential(key: CredentialKey): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.cache.has(key);
  }

  /**
   * Get all stored credential keys
   */
  async listCredentials(): Promise<CredentialKey[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return Array.from(this.cache.keys()) as CredentialKey[];
  }

  /**
   * Clear all stored credentials
   */
  async clearAll(): Promise<void> {
    this.cache.clear();
    
    if (fs.existsSync(this.credentialsPath)) {
      fs.unlinkSync(this.credentialsPath);
    }
    
    console.log("🗑️ All credentials cleared");
  }

  /**
   * Migrate credentials from environment variables to secure store
   * Call this on first run to migrate existing credentials
   */
  async migrateFromEnv(): Promise<void> {
    const envMappings: Record<string, CredentialKey> = {
      ANTHROPIC_API_KEY: "anthropic_api_key",
      GOOGLE_OAUTH_CLIENT_ID: "google_oauth_client_id",
      GOOGLE_OAUTH_CLIENT_SECRET: "google_oauth_client_secret",
      SLACK_OAUTH_CLIENT_ID: "slack_oauth_client_id",
      SLACK_OAUTH_CLIENT_SECRET: "slack_oauth_client_secret",
      MICROSOFT_OAUTH_CLIENT_ID: "microsoft_oauth_client_id",
      CRAFT_MCP_TOKEN: "craft_mcp_token",
      SUPABASE_ANON_KEY: "supabase_anon_key",
      SUPABASE_SERVICE_KEY: "supabase_service_key",
      VITE_MAPBOX_TOKEN: "mapbox_token",
    };

    let migrated = 0;

    for (const [envKey, credKey] of Object.entries(envMappings)) {
      const value = process.env[envKey];
      if (value && !await this.hasCredential(credKey)) {
        await this.setCredential(credKey, value);
        migrated++;
        
        // Clear from process.env after migration
        delete process.env[envKey];
      }
    }

    if (migrated > 0) {
      console.log(`✅ Migrated ${migrated} credentials from environment to secure store`);
    }
  }

  /**
   * Export credentials for backup (encrypted)
   * @returns Encrypted backup string
   */
  async exportCredentials(): Promise<string> {
    const data = Object.fromEntries(this.cache);
    const json = JSON.stringify(data);
    
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(json);
      return encrypted.toString("base64");
    }
    
    // Basic encoding if encryption unavailable
    return Buffer.from(json).toString("base64");
  }

  /**
   * Import credentials from backup
   * @param backup - Encrypted backup string
   */
  async importCredentials(backup: string): Promise<void> {
    try {
      let json: string;
      
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = Buffer.from(backup, "base64");
        json = safeStorage.decryptString(encrypted);
      } else {
        json = Buffer.from(backup, "base64").toString("utf-8");
      }
      
      const data = JSON.parse(json);
      
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === "string") {
          this.cache.set(key, value);
        }
      }
      
      await this.saveCredentials();
      console.log("✅ Credentials imported successfully");
    } catch (error) {
      console.error("❌ Failed to import credentials:", error);
      throw new Error("Invalid backup format");
    }
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  private async saveCredentials(): Promise<void> {
    try {
      const data = Object.fromEntries(this.cache);
      const json = JSON.stringify(data);
      
      let encrypted: Buffer;
      
      if (safeStorage.isEncryptionAvailable()) {
        encrypted = safeStorage.encryptString(json);
      } else {
        // Basic XOR encryption as fallback
        encrypted = this.basicEncrypt(json);
      }
      
      fs.writeFileSync(this.credentialsPath, encrypted);
    } catch (error) {
      console.error("❌ Failed to save credentials:", error);
      throw error;
    }
  }

  private async loadCredentials(): Promise<void> {
    try {
      if (!fs.existsSync(this.credentialsPath)) {
        return;
      }
      
      const encrypted = fs.readFileSync(this.credentialsPath);
      let json: string;
      
      if (safeStorage.isEncryptionAvailable()) {
        json = safeStorage.decryptString(encrypted);
      } else {
        json = this.basicDecrypt(encrypted);
      }
      
      const data = JSON.parse(json);
      
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === "string") {
          this.cache.set(key, value);
        }
      }
      
      console.log(`✅ Loaded ${this.cache.size} credentials from secure store`);
    } catch (error) {
      console.warn("⚠️ Could not load existing credentials:", error);
      // Start fresh if corrupted
      this.cache.clear();
    }
  }

  private basicEncrypt(data: string): Buffer {
    // Simple XOR encryption as fallback (not truly secure, but better than plaintext)
    const key = this.getBasicKey();
    const buffer = Buffer.from(data, "utf-8");
    const encrypted = Buffer.alloc(buffer.length);
    
    for (let i = 0; i < buffer.length; i++) {
      encrypted[i] = buffer[i] ^ key[i % key.length];
    }
    
    return encrypted;
  }

  private basicDecrypt(encrypted: Buffer): string {
    const key = this.getBasicKey();
    const decrypted = Buffer.alloc(encrypted.length);
    
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ key[i % key.length];
    }
    
    return decrypted.toString("utf-8");
  }

  private getBasicKey(): Buffer {
    // Derive key from machine-specific info
    const machineId = process.env.USER || process.env.USERNAME || "zonewise";
    const appPath = app.getPath("userData");
    return Buffer.from(`${machineId}-${appPath}-${SERVICE_NAME}`, "utf-8");
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Get a credential from the secure store
 * @param key - Credential identifier
 */
export async function getSecureCredential(key: CredentialKey): Promise<string | null> {
  const store = SecureStore.getInstance();
  return store.getCredential(key);
}

/**
 * Set a credential in the secure store
 * @param key - Credential identifier
 * @param value - Credential value
 */
export async function setSecureCredential(key: CredentialKey, value: string): Promise<void> {
  const store = SecureStore.getInstance();
  return store.setCredential(key, value);
}

/**
 * Initialize secure store and migrate from env vars
 * Call this during app startup
 */
export async function initializeSecureStore(): Promise<void> {
  const store = SecureStore.getInstance();
  await store.initialize();
  await store.migrateFromEnv();
}

export default SecureStore;
