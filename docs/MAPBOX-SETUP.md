# Mapbox Setup for ZoneWise

## Get Your Free Mapbox Token

1. Go to https://account.mapbox.com/auth/signup/
2. Create a free account (no credit card required)
3. Go to https://account.mapbox.com/access-tokens/
4. Copy your **Default public token**

## Free Tier Limits (Sufficient for ZoneWise)
- 50,000 map loads/month
- 100,000 geocoding requests/month
- No credit card required

## Add Token to ZoneWise

### Option 1: Environment Variable
```powershell
$env:MAPBOX_TOKEN = "pk.your_token_here"
```

### Option 2: Config File
Add to `~/.craft-agent/workspaces/my-workspace/config.json`:
```json
{
  "mapbox": {
    "accessToken": "pk.your_token_here"
  }
}
```

### Option 3: In Map Artifact
Edit `artifacts/zonewise-map.html` and replace:
```javascript
mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';
```
with your actual token.

## Test the Map

1. Open `artifacts/zonewise-map.html` in browser
2. Replace YOUR_MAPBOX_TOKEN with your token
3. Map should display Brevard County with 17 jurisdiction markers

## Jurisdiction Markers Show:
- Circle with district count
- Click for popup with details
- Dropdown to fly to any jurisdiction

## Map Features
- Pan and zoom
- Scale indicator
- Navigation controls
- Color-coded legend
- 17 jurisdiction markers with district counts
