/**
 * Tests for MCP Config Generator — Windows Path Space Fix
 *
 * Covers:
 * - needsWindowsPathFix: platform + space detection
 * - resolveGlobalNpmModulePath: multi-strategy npm global resolution
 * - generateMCPConfig: end-to-end config generation
 *
 * Test scenarios:
 * 1. Windows + spaces in USERPROFILE  → node strategy
 * 2. Windows + no spaces              → npx strategy
 * 3. macOS                            → npx strategy
 * 4. Linux                            → npx strategy
 * 5. Spaces only in serverArgs        → node strategy
 * 6. Custom entryPoint                → correct path
 * 7. env passthrough                  → env preserved
 * 8. Missing package                  → throws
 */

import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  needsWindowsPathFix,
  resolveGlobalNpmModulePath,
  generateMCPConfig,
} from '../mcp-config-generator.ts';

// ============================================================
// Helpers
// ============================================================

let testDir: string;

function createFakePackage(baseDir: string, packageName: string, entryPoint = 'dist/index.js') {
  const pkgDir = join(baseDir, packageName);
  const entryDir = join(pkgDir, entryPoint.substring(0, entryPoint.lastIndexOf('/')));
  mkdirSync(entryDir, { recursive: true });
  writeFileSync(join(pkgDir, entryPoint), '// fake entry\n');
  return join(pkgDir, entryPoint);
}

beforeEach(() => {
  testDir = join(tmpdir(), `mcp-config-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(testDir, { recursive: true });
});

afterEach(() => {
  try {
    rmSync(testDir, { recursive: true, force: true });
  } catch {
    // Best effort cleanup
  }
});

// ============================================================
// needsWindowsPathFix
// ============================================================

describe('needsWindowsPathFix', () => {
  const originalPlatform = process.platform;
  const originalUserProfile = process.env.USERPROFILE;
  const originalHome = process.env.HOME;

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    if (originalUserProfile !== undefined) {
      process.env.USERPROFILE = originalUserProfile;
    } else {
      delete process.env.USERPROFILE;
    }
    if (originalHome !== undefined) {
      process.env.HOME = originalHome;
    } else {
      delete process.env.HOME;
    }
  });

  test('returns true on Windows with spaces in USERPROFILE', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    process.env.USERPROFILE = 'C:\\Users\\Roselyn Sheffield';
    expect(needsWindowsPathFix()).toBe(true);
  });

  test('returns false on Windows with no spaces', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    process.env.USERPROFILE = 'C:\\Users\\Admin';
    process.env.HOME = 'C:\\Users\\Admin';
    expect(needsWindowsPathFix()).toBe(false);
  });

  test('returns false on macOS regardless of spaces', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    process.env.USERPROFILE = '/Users/Roselyn Sheffield';
    expect(needsWindowsPathFix()).toBe(false);
  });

  test('returns false on Linux regardless of spaces', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' });
    process.env.USERPROFILE = '/home/user name';
    expect(needsWindowsPathFix()).toBe(false);
  });

  test('returns true on Windows when only serverArgs have spaces', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    process.env.USERPROFILE = 'C:\\Users\\Admin';
    process.env.HOME = 'C:\\Users\\Admin';
    expect(needsWindowsPathFix(['--config', 'C:\\My Documents\\config.json'])).toBe(true);
  });

  test('returns false on Windows with no spaces anywhere', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    process.env.USERPROFILE = 'C:\\Users\\Admin';
    process.env.HOME = 'C:\\Users\\Admin';
    expect(needsWindowsPathFix(['--port', '3000'])).toBe(false);
  });
});

// ============================================================
// resolveGlobalNpmModulePath
// ============================================================

describe('resolveGlobalNpmModulePath', () => {
  const originalAppData = process.env.APPDATA;

  afterEach(() => {
    if (originalAppData !== undefined) {
      process.env.APPDATA = originalAppData;
    } else {
      delete process.env.APPDATA;
    }
  });

  test('finds package in APPDATA npm global directory', () => {
    const npmGlobal = join(testDir, 'npm', 'node_modules');
    process.env.APPDATA = testDir;
    const expected = createFakePackage(npmGlobal, '@test/mcp-server');
    const result = resolveGlobalNpmModulePath('@test/mcp-server');
    expect(result).toBe(expected);
  });

  test('uses custom entryPoint when provided', () => {
    const npmGlobal = join(testDir, 'npm', 'node_modules');
    process.env.APPDATA = testDir;
    const expected = createFakePackage(npmGlobal, '@custom/server', 'bin/server.js');
    const result = resolveGlobalNpmModulePath('@custom/server', 'bin/server.js');
    expect(result).toBe(expected);
  });

  test('throws for missing package', () => {
    // Point APPDATA to empty dir so static paths don't match
    process.env.APPDATA = testDir;
    // Clear other env vars that might resolve
    const savedNvm = process.env.NVM_HOME;
    const savedVolta = process.env.VOLTA_HOME;
    const savedPnpm = process.env.PNPM_HOME;
    const savedLocal = process.env.LOCALAPPDATA;
    delete process.env.NVM_HOME;
    delete process.env.VOLTA_HOME;
    delete process.env.PNPM_HOME;
    delete process.env.LOCALAPPDATA;

    try {
      expect(() => resolveGlobalNpmModulePath('@nonexistent/pkg-12345')).toThrow(
        /Cannot find globally installed package/
      );
    } finally {
      if (savedNvm !== undefined) process.env.NVM_HOME = savedNvm;
      if (savedVolta !== undefined) process.env.VOLTA_HOME = savedVolta;
      if (savedPnpm !== undefined) process.env.PNPM_HOME = savedPnpm;
      if (savedLocal !== undefined) process.env.LOCALAPPDATA = savedLocal;
    }
  });
});

// ============================================================
// generateMCPConfig
// ============================================================

describe('generateMCPConfig', () => {
  const originalPlatform = process.platform;
  const originalUserProfile = process.env.USERPROFILE;
  const originalHome = process.env.HOME;
  const originalAppData = process.env.APPDATA;

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    if (originalUserProfile !== undefined) {
      process.env.USERPROFILE = originalUserProfile;
    } else {
      delete process.env.USERPROFILE;
    }
    if (originalHome !== undefined) {
      process.env.HOME = originalHome;
    } else {
      delete process.env.HOME;
    }
    if (originalAppData !== undefined) {
      process.env.APPDATA = originalAppData;
    } else {
      delete process.env.APPDATA;
    }
  });

  test('uses npx on macOS (auto strategy)', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    const result = generateMCPConfig({ packageName: '@test/server' });
    expect(result.command).toBe('npx');
    expect(result.args).toEqual(['@test/server']);
  });

  test('uses npx on Linux (auto strategy)', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' });
    const result = generateMCPConfig({ packageName: '@test/server' });
    expect(result.command).toBe('npx');
    expect(result.args).toEqual(['@test/server']);
  });

  test('uses npx on Windows without spaces (auto strategy)', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    process.env.USERPROFILE = 'C:\\Users\\Admin';
    process.env.HOME = 'C:\\Users\\Admin';
    const result = generateMCPConfig({
      packageName: '@test/server',
      serverArgs: ['--port', '3000'],
    });
    expect(result.command).toBe('npx');
    expect(result.args).toEqual(['@test/server', '--port', '3000']);
  });

  test('uses node on Windows with spaces in USERPROFILE (auto strategy)', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    process.env.USERPROFILE = 'C:\\Users\\Roselyn Sheffield';
    process.env.APPDATA = testDir;

    // Create fake global package
    const npmGlobal = join(testDir, 'npm', 'node_modules');
    createFakePackage(npmGlobal, '@test/server');

    const result = generateMCPConfig({ packageName: '@test/server' });
    expect(result.command).toBe('node');
    expect(result.args[0]).toContain(join('@test', 'server'));
    expect(result.args[0]).toContain(join('dist', 'index.js'));
  });

  test('uses node when only serverArgs have spaces (auto strategy)', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    process.env.USERPROFILE = 'C:\\Users\\Admin';
    process.env.HOME = 'C:\\Users\\Admin';
    process.env.APPDATA = testDir;

    const npmGlobal = join(testDir, 'npm', 'node_modules');
    createFakePackage(npmGlobal, '@test/server');

    const result = generateMCPConfig({
      packageName: '@test/server',
      serverArgs: ['--config', 'C:\\My Documents\\config.json'],
    });
    expect(result.command).toBe('node');
    expect(result.args[0]).toContain(join('dist', 'index.js'));
    expect(result.args).toContain('--config');
    expect(result.args).toContain('C:\\My Documents\\config.json');
  });

  test('respects custom entryPoint', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    process.env.USERPROFILE = 'C:\\Users\\Roselyn Sheffield';
    process.env.APPDATA = testDir;

    const npmGlobal = join(testDir, 'npm', 'node_modules');
    createFakePackage(npmGlobal, '@test/server', 'bin/cli.js');

    const result = generateMCPConfig({
      packageName: '@test/server',
      entryPoint: 'bin/cli.js',
    });
    expect(result.command).toBe('node');
    expect(result.args[0]).toContain(join('bin', 'cli.js'));
  });

  test('passes env through to result', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    const env = { API_KEY: 'secret-123', DEBUG: 'true' };
    const result = generateMCPConfig({
      packageName: '@test/server',
      env,
    });
    expect(result.env).toEqual(env);
  });

  test('omits env when empty', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    const result = generateMCPConfig({ packageName: '@test/server' });
    expect(result.env).toBeUndefined();
  });

  test('throws when package not found in node strategy', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    process.env.USERPROFILE = 'C:\\Users\\Roselyn Sheffield';
    process.env.APPDATA = testDir;

    // Clear other env vars
    const savedNvm = process.env.NVM_HOME;
    const savedVolta = process.env.VOLTA_HOME;
    const savedPnpm = process.env.PNPM_HOME;
    const savedLocal = process.env.LOCALAPPDATA;
    delete process.env.NVM_HOME;
    delete process.env.VOLTA_HOME;
    delete process.env.PNPM_HOME;
    delete process.env.LOCALAPPDATA;

    try {
      expect(() =>
        generateMCPConfig({ packageName: '@nonexistent/mcp-server-xyz' })
      ).toThrow(/Cannot find globally installed package/);
    } finally {
      if (savedNvm !== undefined) process.env.NVM_HOME = savedNvm;
      if (savedVolta !== undefined) process.env.VOLTA_HOME = savedVolta;
      if (savedPnpm !== undefined) process.env.PNPM_HOME = savedPnpm;
      if (savedLocal !== undefined) process.env.LOCALAPPDATA = savedLocal;
    }
  });

  test('force npx strategy ignores Windows spaces', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    process.env.USERPROFILE = 'C:\\Users\\Roselyn Sheffield';
    const result = generateMCPConfig({
      packageName: '@test/server',
      strategy: 'npx',
    });
    expect(result.command).toBe('npx');
    expect(result.args).toEqual(['@test/server']);
  });

  test('force node strategy works on macOS', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    process.env.APPDATA = testDir;

    const npmGlobal = join(testDir, 'npm', 'node_modules');
    createFakePackage(npmGlobal, '@test/server');

    const result = generateMCPConfig({
      packageName: '@test/server',
      strategy: 'node',
    });
    expect(result.command).toBe('node');
    expect(result.args[0]).toContain(join('dist', 'index.js'));
  });
});
