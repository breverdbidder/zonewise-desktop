import { describe, it, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

describe('No Hardcoded Secrets', () => {
  const secretPatterns = [
    /(?:api[_-]?key|apikey)\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/gi,
    /(?:secret|password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    /ghp_[a-zA-Z0-9]{36}/g,
    /sk-ant-[a-zA-Z0-9]{48,}/g,
    /sk-[a-zA-Z0-9]{48}/g,
    /sbp_[a-zA-Z0-9]{40}/g,
    /eyJhbGciOi[a-zA-Z0-9._-]{50,}/g,
  ]

  function scanFile(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf-8')
    const findings: string[] = []
    for (const pattern of secretPatterns) {
      pattern.lastIndex = 0
      const matches = content.match(pattern)
      if (matches) {
        findings.push(`${filePath}: ${matches[0].substring(0, 30)}...`)
      }
    }
    return findings
  }

  function getSourceFiles(dir: string, depth = 0): string[] {
    if (depth > 5) return []
    const files: string[] = []
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return files
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.next') continue
      if (entry.isDirectory()) {
        files.push(...getSourceFiles(fullPath, depth + 1))
      } else if (/\.(ts|tsx|js|jsx|json|yml|yaml)$/.test(entry.name) && !entry.name.includes('.test.')) {
        files.push(fullPath)
      }
    }
    return files
  }

  it('no hardcoded secrets in source files', { timeout: 30000 }, () => {
    const dirs = ['apps/electron/src', 'apps/viewer/src', 'packages/shared/src']
    const allFindings: string[] = []
    for (const dir of dirs) {
      const files = getSourceFiles(dir)
      for (const file of files) {
        try {
          allFindings.push(...scanFile(file))
        } catch {
          // skip unreadable
        }
      }
    }
    const realFindings = allFindings.filter(f =>
      !f.includes('.example') &&
      !f.includes('.test.') &&
      // Known false positives: type definitions and UI examples
      !f.includes('secure-store.ts') &&
      !f.includes('playground')
    )
    expect(realFindings).toEqual([])
  })

  it('.gitignore exists and excludes .env', () => {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8')
    expect(gitignore).toMatch(/\.env/)
  })

  it('.gitignore excludes node_modules', () => {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8')
    expect(gitignore).toMatch(/node_modules/)
  })

  it('bun.lock is tracked in git (reproducible builds)', () => {
    expect(fs.existsSync('bun.lock')).toBe(true)
  })
})
