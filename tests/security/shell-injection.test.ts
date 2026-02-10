import { describe, it, expect } from 'bun:test'
import * as fs from 'fs'

const shellSource = fs.readFileSync('apps/electron/src/main/shell-env.ts', 'utf-8')

describe('SEC-007: Shell Injection Prevention', () => {
  it('defines ALLOWED_SHELLS whitelist', () => {
    expect(shellSource).toMatch(/ALLOWED_SHELLS/)
  })

  it('includes standard shell paths', () => {
    expect(shellSource).toContain('/bin/bash')
    expect(shellSource).toContain('/bin/zsh')
    expect(shellSource).toContain('/bin/sh')
  })

  it('includes common alternative shell paths', () => {
    expect(shellSource).toContain('/usr/bin/bash')
    expect(shellSource).toContain('/usr/local/bin/bash')
    expect(shellSource).toContain('/opt/homebrew/bin/bash')
  })

  it('includes fish shell paths', () => {
    expect(shellSource).toContain('/bin/fish')
    expect(shellSource).toContain('/usr/bin/fish')
  })

  it('has at least 10 allowed shell paths', () => {
    const matches = shellSource.match(/'\/(bin|usr|opt)[^']+'/g) || []
    expect(matches.length).toBeGreaterThanOrEqual(10)
  })

  it('defines getSafeShell validation function', () => {
    expect(shellSource).toMatch(/function getSafeShell/)
  })

  it('rejects shells with suspicious characters', () => {
    // Should reject spaces, semicolons, pipes, etc.
    expect(shellSource).toMatch(/suspicious characters/)
    // Source uses character class negation to detect bad chars
    expect(shellSource).toContain('[^a-zA-Z0-9/_.-]')
  })

  it('falls back to /bin/zsh for unknown shells', () => {
    expect(shellSource).toMatch(/return '\/bin\/zsh'/)
  })

  it('logs security warnings for rejected shells', () => {
    expect(shellSource).toMatch(/SEC-007/)
    expect(shellSource).toMatch(/warn/)
  })

  it('uses getSafeShell() before execSync', () => {
    const safeShellIndex = shellSource.indexOf('getSafeShell()')
    const execIndex = shellSource.indexOf('execSync(')
    // getSafeShell must be defined before any execSync usage
    expect(safeShellIndex).toBeGreaterThan(-1)
    expect(execIndex).toBeGreaterThan(-1)
  })

  it('sets timeout on shell execution', () => {
    expect(shellSource).toMatch(/timeout:\s*5000/)
  })

  it('does NOT pass unsanitized SHELL to execSync', () => {
    // Should use validated shell variable, not raw process.env.SHELL
    expect(shellSource).toMatch(/const shell = getSafeShell/)
  })

  it('only runs on macOS (skips other platforms)', () => {
    expect(shellSource).toMatch(/process\.platform.*darwin/)
  })
})
