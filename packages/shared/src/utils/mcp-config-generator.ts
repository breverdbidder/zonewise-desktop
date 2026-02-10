/**
 * MCP Config Generator — Windows Path Space Fix
 *
 * On Windows, cmd.exe /C spawns MCP servers via npx. When any argument
 * contains a space (e.g. C:\Users\Roselyn Sheffield\Documents), the spawn
 * fails silently because cmd.exe misparses the quoted arguments.
 *
 * Fix: detect paths-with-spaces and use "node" with the fully-resolved
 * global module path (dist/index.js) instead of "npx".
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// ============================================================
// Types
// ============================================================

export interface MCPConfigOptions {
  /** npm package name (e.g. "@anthropic-ai/mcp-server-fetch") */
  packageName: string;

  /** Extra CLI args to pass after the resolved entry point */
  serverArgs?: string[];

  /** Environment variables to set on the spawned process */
  env?: Record<string, string>;

  /**
   * Custom entry point relative to the package directory.
   * Defaults to "dist/index.js".
   */
  entryPoint?: string;

  /**
   * Force a specific resolution strategy.
   * - "npx"  — always use npx (default on non-Windows / no-spaces)
   * - "node" — always resolve to node + full path
   * - "auto" — detect platform & spaces (default)
   */
  strategy?: 'npx' | 'node' | 'auto';
}

export interface MCPConfigResult {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

// ============================================================
// Detection
// ============================================================

/**
 * Returns true when the current Windows environment has spaces in paths
 * that will break cmd.exe /C npx invocations.
 *
 * Checks:
 * 1. USERPROFILE contains a space
 * 2. Any provided serverArg contains a space
 */
export function needsWindowsPathFix(serverArgs?: string[]): boolean {
  if (process.platform !== 'win32') return false;

  const userProfile = process.env.USERPROFILE || process.env.HOME || '';
  if (userProfile.includes(' ')) return true;

  if (serverArgs?.some(arg => arg.includes(' '))) return true;

  return false;
}

// ============================================================
// Global npm Module Resolution
// ============================================================

/**
 * Known npm global module directories, ordered by priority.
 * Each entry is an env-var-based path template that may contain the package.
 */
function getGlobalSearchPaths(): string[] {
  const paths: string[] = [];
  const appData = process.env.APPDATA;
  const localAppData = process.env.LOCALAPPDATA;
  const nvmHome = process.env.NVM_HOME;
  const voltaHome = process.env.VOLTA_HOME;
  const pnpmHome = process.env.PNPM_HOME;

  // 1. Standard npm global (most common on Windows)
  if (appData) {
    paths.push(join(appData, 'npm', 'node_modules'));
  }

  // 2. nvm-windows — each Node version has its own node_modules
  if (nvmHome) {
    const nvmCurrent = process.env.NVM_SYMLINK;
    if (nvmCurrent) {
      paths.push(join(nvmCurrent, 'node_modules'));
    }
    // Also check the version-specific directory via process.version
    const ver = process.version?.replace(/^v/, '');
    if (ver) {
      paths.push(join(nvmHome, `v${ver}`, 'node_modules'));
    }
  }

  // 3. Volta
  if (voltaHome) {
    paths.push(join(voltaHome, 'tools', 'node', 'lib', 'node_modules'));
  } else if (localAppData) {
    paths.push(join(localAppData, 'Volta', 'tools', 'node', 'lib', 'node_modules'));
  }

  // 4. pnpm global
  if (pnpmHome) {
    paths.push(join(pnpmHome, 'global', 'node_modules'));
  } else if (localAppData) {
    paths.push(join(localAppData, 'pnpm', 'global', 'node_modules'));
  }

  return paths;
}

/**
 * Resolves the full filesystem path to a globally-installed npm package's
 * entry point.
 *
 * Search order:
 * 1. %APPDATA%\npm\node_modules\<pkg>
 * 2. nvm-windows current symlink
 * 3. Volta tool directory
 * 4. pnpm global store
 * 5. Fallback: `npm root -g` shell command
 *
 * @throws Error if the package cannot be found in any global location
 */
export function resolveGlobalNpmModulePath(
  packageName: string,
  entryPoint = 'dist/index.js'
): string {
  // Fast path: check well-known directories
  for (const searchPath of getGlobalSearchPaths()) {
    const candidate = join(searchPath, packageName, entryPoint);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  // Slow path: ask npm itself
  try {
    const npmRoot = execSync('npm root -g', {
      encoding: 'utf-8',
      timeout: 10_000,
      windowsHide: true,
    }).trim();

    const candidate = join(npmRoot, packageName, entryPoint);
    if (existsSync(candidate)) {
      return candidate;
    }
  } catch {
    // npm not available or timed out — fall through to error
  }

  throw new Error(
    `Cannot find globally installed package "${packageName}". ` +
    `Install it with: npm install -g ${packageName}`
  );
}

// ============================================================
// Config Generator
// ============================================================

/**
 * Generates an MCP server spawn configuration that works on all platforms,
 * including Windows paths with spaces.
 *
 * On Windows with spaces: resolves the full path and uses `node` directly.
 * Otherwise: uses `npx` for zero-config convenience.
 */
export function generateMCPConfig(options: MCPConfigOptions): MCPConfigResult {
  const {
    packageName,
    serverArgs = [],
    env,
    entryPoint = 'dist/index.js',
    strategy = 'auto',
  } = options;

  const useNode =
    strategy === 'node' ||
    (strategy === 'auto' && needsWindowsPathFix(serverArgs));

  if (useNode) {
    const resolvedPath = resolveGlobalNpmModulePath(packageName, entryPoint);
    return {
      command: 'node',
      args: [resolvedPath, ...serverArgs],
      ...(env && Object.keys(env).length > 0 ? { env } : {}),
    };
  }

  // Default: use npx (works on macOS/Linux and Windows without spaces)
  return {
    command: 'npx',
    args: [packageName, ...serverArgs],
    ...(env && Object.keys(env).length > 0 ? { env } : {}),
  };
}
