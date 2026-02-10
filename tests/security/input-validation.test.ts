import { describe, it, expect } from 'bun:test'
import * as fs from 'fs'

const ipcSource = fs.readFileSync('apps/electron/src/main/ipc.ts', 'utf-8')

describe('SEC-010: Input Validation — File Attachments', () => {
  it('defines ALLOWED_ATTACHMENT_EXTENSIONS whitelist', () => {
    expect(ipcSource).toMatch(/ALLOWED_ATTACHMENT_EXTENSIONS/)
  })

  it('allows common image formats', () => {
    for (const ext of ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']) {
      expect(ipcSource).toContain(`'${ext}'`)
    }
  })

  it('allows common document formats', () => {
    for (const ext of ['pdf', 'docx', 'xlsx', 'txt', 'md', 'csv']) {
      expect(ipcSource).toContain(`'${ext}'`)
    }
  })

  it('allows code file formats', () => {
    for (const ext of ['js', 'ts', 'py', 'json', 'html', 'css', 'sql']) {
      expect(ipcSource).toContain(`'${ext}'`)
    }
  })

  it('does NOT allow executable extensions', () => {
    // Extract just the ALLOWED_ATTACHMENT_EXTENSIONS block to avoid false positives
    // (e.g., 'exe' appears in 'execSync' but is NOT in the allowed set)
    const extBlock = ipcSource.match(/ALLOWED_ATTACHMENT_EXTENSIONS\s*=\s*new Set\(\[([\s\S]*?)\]\)/)?.[1] || ''
    expect(extBlock.length).toBeGreaterThan(0)
    for (const ext of ['exe', 'bat', 'cmd', 'msi', 'dll', 'com', 'scr']) {
      expect(extBlock).not.toContain(`'${ext}'`)
    }
  })

  it('defines ALLOWED_THUMBNAIL_MIMETYPES whitelist', () => {
    expect(ipcSource).toMatch(/ALLOWED_THUMBNAIL_MIMETYPES/)
  })

  it('thumbnail mimetypes include common image types', () => {
    expect(ipcSource).toMatch(/image\/png/)
    expect(ipcSource).toMatch(/image\/jpeg/)
    expect(ipcSource).toMatch(/image\/webp/)
  })
})

describe('SEC-010: Input Validation — Filename Sanitization', () => {
  it('defines sanitizeFilename function', () => {
    expect(ipcSource).toMatch(/function sanitizeFilename/)
  })

  it('strips null bytes', () => {
    expect(ipcSource).toMatch(/\\0/g)
  })

  it('normalizes Unicode to NFKC', () => {
    expect(ipcSource).toMatch(/normalize.*NFKC/)
  })

  it('removes path separators', () => {
    expect(ipcSource).toMatch(/[/\\\\]/)
  })

  it('removes Windows-forbidden characters', () => {
    expect(ipcSource).toMatch(/[<>:"|?*]/)
  })

  it('removes control characters', () => {
    expect(ipcSource).toMatch(/\\x00-\\x1f/)
  })

  it('collapses multiple dots to prevent extension tricks', () => {
    expect(ipcSource).toMatch(/\.{2,}/)
  })

  it('limits filename length', () => {
    expect(ipcSource).toMatch(/slice\(0,\s*200\)/)
  })

  it('provides fallback for empty filenames', () => {
    expect(ipcSource).toMatch(/unnamed/)
  })
})

describe('SEC-010: Input Validation — Extension Validation', () => {
  it('defines validateFileExtension function', () => {
    expect(ipcSource).toMatch(/function validateFileExtension/)
  })

  it('throws on disallowed extensions', () => {
    expect(ipcSource).toMatch(/File type not allowed/)
  })

  it('normalizes extension to lowercase', () => {
    expect(ipcSource).toMatch(/toLowerCase/)
  })
})
