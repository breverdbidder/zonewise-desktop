# ZoneWise Desktop Distribution Guide

## Quick Build (Local)

### Prerequisites
- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- Windows 10/11 (for Windows builds)
- Node.js 18+ (fallback)

### Build Windows Installer

```powershell
cd "C:\Users\Roselyn Sheffield\zonewise-desktop"
git pull

cd apps\electron
bun install
bun run build:win
bun run dist:win
```

**Output:** `apps/electron/release/ZoneWise Setup 1.0.0.exe`

### Build macOS DMG (on Mac)

```bash
cd zonewise-desktop/apps/electron
bun install
bun run build
bun run dist:mac
```

**Output:** `apps/electron/release/ZoneWise-1.0.0.dmg`

---

## GitHub Actions Build (Automated)

### Trigger Build Manually
1. Go to: https://github.com/breverdbidder/zonewise-desktop/actions
2. Click "Build & Release ZoneWise"
3. Click "Run workflow"
4. Download artifacts when complete

### Create Release with Tag
```bash
git tag v1.0.0
git push origin v1.0.0
```

This automatically:
- Builds Windows .exe
- Builds macOS .dmg
- Creates GitHub Release
- Uploads installers

---

## Distribution Files

| Platform | File | Size (approx) |
|----------|------|---------------|
| Windows | `ZoneWise Setup 1.0.0.exe` | ~180 MB |
| Windows Portable | `ZoneWise 1.0.0.exe` | ~180 MB |
| macOS (Intel) | `ZoneWise-1.0.0-x64.dmg` | ~200 MB |
| macOS (Apple Silicon) | `ZoneWise-1.0.0-arm64.dmg` | ~200 MB |

---

## Version Checklist

Before releasing:

- [ ] Update version in `apps/electron/package.json`
- [ ] Update CHANGELOG.md
- [ ] Test locally with `bun run start:win`
- [ ] Verify Supabase connection works
- [ ] Verify Mapbox token is valid
- [ ] Test zoning polygon loading
- [ ] Create git tag
- [ ] Push tag to trigger build

---

## Custom Branding

### App Identity
- **App ID:** `com.zonewise.desktop`
- **Product Name:** ZoneWise
- **Copyright:** Everest Capital USA

### Icons (need to create)
- `resources/icon.ico` - Windows (256x256 multi-res)
- `resources/icon.icns` - macOS
- `resources/icon.png` - Linux (512x512)

### Generate Icons
Use https://www.electron.build/icons or:
```bash
# From a 1024x1024 PNG
npx electron-icon-builder --input=icon-source.png --output=resources
```

---

## Auto-Update

Configured for GitHub Releases:
```yaml
publish:
  provider: github
  owner: breverdbidder
  repo: zonewise-desktop
```

Users will receive update notifications when new releases are published.

---

## Troubleshooting

### "electron-builder not found"
```bash
bun add -D electron-builder
```

### Build fails on Windows
```powershell
# Run as Administrator
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Missing Bun vendor
The build expects `vendor/bun/` directory with platform-specific Bun runtime.
