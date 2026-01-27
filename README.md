# 🗺️ ZoneWise Desktop

**Brevard County Zoning Intelligence Platform**

A white-labeled [Craft Agents](https://craft.do) application providing AI-powered zoning assistance for Brevard County, Florida real estate professionals.

---

## 🚀 Quick Start

### Option 1: Launch with Craft Agents (Recommended)

1. **Open Craft Agents**
2. **Connect to GitHub Repository:**
   ```
   https://github.com/breverdbidder/zonewise-desktop
   ```
3. **Craft Agents will automatically:**
   - Load the CLAUDE.md system prompt
   - Read .craft/config.json for branding
   - Connect to Supabase for zoning data
   - Enable map visualization skills

4. **Start chatting:**
   > "What are the setbacks for R-1 zoning in Satellite Beach?"

### Option 2: Run Windows Installer

1. Download from [GitHub Releases](https://github.com/breverdbidder/zonewise-desktop/releases)
2. Run `ZoneWise Setup 1.0.0.exe`
3. Launch ZoneWise from Start Menu

### Option 3: Build from Source

```powershell
git clone https://github.com/breverdbidder/zonewise-desktop.git
cd zonewise-desktop/apps/electron
bun install
bun run build:win
bun run start:win
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏠 **Zoning Queries** | Query setbacks, heights, lot sizes for any zone |
| 🗺️ **Interactive Map** | 10,092 real zoning polygons from County GIS |
| 🏛️ **17 Jurisdictions** | All Brevard County municipalities covered |
| 📊 **301 Districts** | Complete zoning database with dimensional standards |
| 🎨 **Color-Coded** | Visual classification by category |
| 💬 **Natural Language** | Ask questions in plain English |

---

## 🏛️ Covered Jurisdictions

| Jurisdiction | Districts | Status |
|--------------|-----------|--------|
| Melbourne | 26 | ✅ |
| Palm Bay | 25 | ✅ |
| Titusville | 40 | ✅ |
| Unincorporated Brevard | 54 | ✅ |
| Melbourne Village | 23 | ✅ |
| Cocoa | 21 | ✅ |
| Rockledge | 21 | ✅ |
| Malabar | 13 | ✅ |
| Indian Harbour Beach | 12 | ✅ |
| Cocoa Beach | 12 | ✅ |
| West Melbourne | 11 | ✅ |
| Cape Canaveral | 9 | ✅ |
| Satellite Beach | 8 | ✅ |
| Indialantic | 8 | ✅ |
| Melbourne Beach | 8 | ✅ |
| Grant-Valkaria | 6 | ✅ |
| Palm Shores | 4 | ✅ |

---

## 💬 Example Queries

```
"What are the setbacks for C-1 zoning in Satellite Beach?"

"Can I build a 4-story building in Melbourne?"

"Compare R-1 and R-2 zones in Indian Harbour Beach"

"What zones allow commercial use in Palm Bay?"

"Show me the maximum building height in Titusville"

"List all residential zones in Unincorporated Brevard"
```

---

## 🗺️ Map Visualization

The interactive map displays real zoning polygons from Brevard County GIS:

- **Color-coded by category** (Residential, Commercial, Industrial, etc.)
- **Click any polygon** for zoning details
- **Jurisdiction selector** to fly to any municipality
- **Real-time data** from County GIS server

**Open the map:**
```
artifacts/zonewise-map.html
```

---

## 📁 Project Structure

```
zonewise-desktop/
├── .craft/
│   └── config.json          # Craft Agents configuration
├── apps/electron/           # Electron application
│   ├── src/
│   │   ├── renderer/components/zonewise/
│   │   │   ├── MapPanel.tsx
│   │   │   └── index.ts
│   ├── electron-builder.yml
│   └── package.json
├── artifacts/
│   └── zonewise-map.html    # Interactive zoning map
├── skills/
│   ├── SKILL-zoning-lookup.md
│   ├── SKILL-setback-calculator.md
│   └── SKILL-map-visualization.md
├── docs/
│   └── MAPBOX-SETUP.md
├── .github/workflows/
│   └── build-release.yml    # CI/CD pipeline
├── CLAUDE.md                # AI system prompt
├── DISTRIBUTION.md          # Build instructions
└── README.md                # This file
```

---

## 🔧 Configuration

### Supabase Connection
```json
{
  "url": "https://mocerqjnksmhcjzxrewo.supabase.co",
  "tables": ["zoning_districts", "jurisdictions"]
}
```

### Mapbox Token
```
pk.eyJ1IjoiZXZlcmVzdDE4IiwiYSI6ImNtanB5cDQ5ZzF1eWgzaHB2cGVhZXdqbjMifQ.4RPrkTf84GL1-clmhmCnTw
```

### GIS Endpoint
```
https://gis.brevardfl.gov/gissrv/rest/services/Planning_Development/Zoning_WKID2881/MapServer/0
```

---

## 🏗️ Development

### Prerequisites
- [Bun](https://bun.sh) (recommended) or Node.js 20+
- Git

### Install Dependencies
```bash
cd apps/electron
bun install
```

### Run Development
```bash
bun run dev
```

### Build for Production
```bash
# Windows
bun run build:win
bun run dist:win

# macOS
bun run build
bun run dist:mac
```

---

## 📦 Releases

| Platform | Download |
|----------|----------|
| Windows Installer | [ZoneWise Setup 1.0.0.exe](https://github.com/breverdbidder/zonewise-desktop/releases) |
| Windows Portable | [ZoneWise-portable.zip](https://github.com/breverdbidder/zonewise-desktop/releases) |
| macOS DMG | Coming soon |

---

## 📜 License

Proprietary - Everest Capital USA

---

## 🙏 Credits

- Built on [Craft Agents](https://craft.do) by Craft Docs Ltd.
- Map tiles by [Mapbox](https://mapbox.com)
- Zoning data from [Brevard County GIS](https://gis.brevardfl.gov)
- Database hosted on [Supabase](https://supabase.com)

---

*ZoneWise Desktop v1.0.0 - January 2026*
*© Everest Capital USA*
