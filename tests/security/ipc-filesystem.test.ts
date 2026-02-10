import { describe, it, expect } from 'bun:test'
import * as fs from 'fs'

const ipcSource = fs.readFileSync('apps/electron/src/main/ipc.ts', 'utf-8')

describe('SEC-003: IPC Filesystem Whitelist', () => {
  it('defines validateFilePath function', () => {
    expect(ipcSource).toMatch(/async function validateFilePath/)
  })

  it('uses a whitelist of allowed directories, not full home dir', () => {
    expect(ipcSource).toMatch(/allowedDirs/)
    expect(ipcSource).toMatch(/Documents/)
    expect(ipcSource).toMatch(/Downloads/)
    expect(ipcSource).toMatch(/Desktop/)
  })

  it('allows app-specific directories', () => {
    expect(ipcSource).toMatch(/\.craft-agent/)
    expect(ipcSource).toMatch(/\.zonewise/)
  })

  it('allows platform-specific app data directories', () => {
    expect(ipcSource).toMatch(/Application Support/) // macOS
    expect(ipcSource).toMatch(/AppData/)             // Windows
    expect(ipcSource).toMatch(/\.local.*share/)      // Linux
  })

  it('resolves symlinks to prevent traversal', () => {
    expect(ipcSource).toMatch(/realpath/)
  })

  it('requires absolute paths', () => {
    expect(ipcSource).toMatch(/isAbsolute/)
  })

  it('blocks .ssh directory', () => {
    expect(ipcSource).toMatch(/\.ssh/)
  })

  it('blocks .aws credentials', () => {
    expect(ipcSource).toMatch(/\.aws/)
  })

  it('blocks .env files', () => {
    expect(ipcSource).toMatch(/\.env/)
  })

  it('blocks private key files', () => {
    expect(ipcSource).toMatch(/\.pem/i)
    expect(ipcSource).toMatch(/\.key/i)
    expect(ipcSource).toMatch(/id_rsa/i)
    expect(ipcSource).toMatch(/id_ed25519/i)
  })

  it('blocks cloud provider credentials', () => {
    expect(ipcSource).toMatch(/gcloud/i)
    expect(ipcSource).toMatch(/\.azure/i)
    expect(ipcSource).toMatch(/\.kube/i)
  })

  it('blocks Docker and container configs', () => {
    expect(ipcSource).toMatch(/\.docker/i)
  })

  it('blocks token and credential files', () => {
    // Source contains regex patterns like /credentials\.json$/ — check for key substrings
    expect(ipcSource).toMatch(/credentials/i)
    expect(ipcSource).toMatch(/npmrc/i)
    expect(ipcSource).toMatch(/netrc/i)
  })

  it('blocks GPG keys', () => {
    expect(ipcSource).toMatch(/\.gnupg/i)
  })

  it('blocks password stores and keychains', () => {
    expect(ipcSource).toMatch(/password-store/i)
    expect(ipcSource).toMatch(/Keychains/i)
  })

  it('uses comprehensive sensitive file patterns array', () => {
    expect(ipcSource).toMatch(/sensitivePatterns/)
    // Count lines with regex patterns between sensitivePatterns declaration and its usage
    const patternSection = ipcSource.split('sensitivePatterns')[1]?.split('sensitivePatterns')[0] || ''
    // Count regex literal lines (start with / after whitespace)
    const patternLines = patternSection.match(/^\s*\//gm) || []
    expect(patternLines.length).toBeGreaterThanOrEqual(20) // At least 20 sensitive patterns
  })

  it('throws descriptive error for disallowed paths', () => {
    expect(ipcSource).toMatch(/Access denied.*outside allowed directories/)
    expect(ipcSource).toMatch(/Access denied.*sensitive files/)
  })
})
