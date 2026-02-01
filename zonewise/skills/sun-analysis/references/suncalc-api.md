# SunCalc API Reference

## Installation

```bash
npm install suncalc
# or
bun add suncalc
```

## Core Functions

### getPosition(date, lat, lng)

Returns sun position for given time and location.

```typescript
import SunCalc from 'suncalc';

const pos = SunCalc.getPosition(new Date(), 28.004, -80.5687);

// Returns:
// {
//   altitude: number,  // Sun altitude above horizon in radians
//   azimuth: number    // Sun azimuth in radians (direction along horizon)
// }
```

**Important**: SunCalc azimuth is measured from SOUTH, clockwise.
Convert to north-based: `azimuthFromNorth = azimuth + Math.PI`

### getTimes(date, lat, lng)

Returns key sun times for a date.

```typescript
const times = SunCalc.getTimes(new Date(), 28.004, -80.5687);

// Returns:
// {
//   sunrise: Date,
//   sunriseEnd: Date,
//   goldenHourEnd: Date,
//   solarNoon: Date,
//   goldenHour: Date,
//   sunsetStart: Date,
//   sunset: Date,
//   dusk: Date,
//   nauticalDusk: Date,
//   night: Date,
//   nadir: Date,
//   nightEnd: Date,
//   nauticalDawn: Date,
//   dawn: Date
// }
```

### getMoonPosition(date, lat, lng)

Returns moon position (not used in ZoneWise).

### getMoonIllumination(date)

Returns moon illumination (not used in ZoneWise).

## Coordinate System

```
       N (0°)
        |
        |
W (270°)-------- E (90°)
        |
        |
       S (180°)
```

## Altitude Values

| Altitude | Description |
|----------|-------------|
| > 0° | Sun visible |
| 0° | Horizon |
| -0.833° | Sunrise/Sunset (accounting for refraction) |
| -6° | Civil dusk |
| -12° | Nautical dusk |
| -18° | Astronomical dusk |

## TypeScript Types

```typescript
interface SunPosition {
  altitude: number;  // radians
  azimuth: number;   // radians (from south)
}

interface SunTimes {
  sunrise: Date;
  sunset: Date;
  // ... other times
}
```
