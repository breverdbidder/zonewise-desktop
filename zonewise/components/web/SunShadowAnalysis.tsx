import { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import * as SunCalc from 'suncalc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sun, Moon } from 'lucide-react';

interface SunShadowAnalysisProps {
  dimensions?: {
    front_setback?: string;
    rear_setback?: string;
    side_setback?: string;
    max_height?: string;
  };
  lotWidth?: number;
  lotDepth?: number;
  latitude?: number;
  longitude?: number;
}

function parseNumeric(value?: string): number | null {
  if (!value) return null;
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

interface SunPosition {
  altitude: number;
  azimuth: number;
}

function Scene({
  dimensions,
  lotWidth = 100,
  lotDepth = 150,
  sunPosition,
}: {
  dimensions?: SunShadowAnalysisProps['dimensions'];
  lotWidth: number;
  lotDepth: number;
  sunPosition: SunPosition;
}) {
  const shadowRef = useRef<THREE.Mesh>(null);

  // Parse dimensional standards
  const frontSetback = parseNumeric(dimensions?.front_setback) || 25;
  const rearSetback = parseNumeric(dimensions?.rear_setback) || 20;
  const sideSetback = parseNumeric(dimensions?.side_setback) || 10;
  const maxHeight = parseNumeric(dimensions?.max_height) || 35;

  // Calculate buildable area
  const buildableWidth = lotWidth - sideSetback * 2;
  const buildableDepth = lotDepth - frontSetback - rearSetback;
  const buildableHeight = maxHeight;

  // Calculate sun position in 3D space
  const sunAltitudeDeg = (sunPosition.altitude * 180) / Math.PI;
  const sunAzimuthDeg = (sunPosition.azimuth * 180) / Math.PI;

  // Convert to Cartesian coordinates for light position
  const sunDistance = 200;
  const sunX = sunDistance * Math.sin(sunPosition.azimuth) * Math.cos(sunPosition.altitude);
  const sunY = sunDistance * Math.sin(sunPosition.altitude);
  const sunZ = sunDistance * Math.cos(sunPosition.azimuth) * Math.cos(sunPosition.altitude);

  // Calculate shadow projection
  const shadowLength = sunPosition.altitude > 0 ? buildableHeight / Math.tan(sunPosition.altitude) : 0;
  const shadowAngle = sunPosition.azimuth;

  // Animate sun indicator
  useFrame((state) => {
    if (shadowRef.current && sunPosition.altitude > 0) {
      shadowRef.current.rotation.y = shadowAngle;
    }
  });

  return (
    <group>
      {/* Lot boundary */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[lotWidth, 0.1, lotDepth]} />
        <meshStandardMaterial color="#10b981" opacity={0.2} transparent />
      </mesh>

      {/* Buildable envelope */}
      <mesh position={[0, buildableHeight / 2, (frontSetback - rearSetback) / 2]}>
        <boxGeometry args={[buildableWidth, buildableHeight, buildableDepth]} />
        <meshStandardMaterial color="#3b82f6" opacity={0.7} transparent />
      </mesh>

      {/* Shadow projection (only when sun is above horizon) */}
      {sunPosition.altitude > 0 && shadowLength > 0 && (
        <mesh
          ref={shadowRef}
          position={[
            Math.sin(shadowAngle) * (shadowLength / 2),
            0.01,
            Math.cos(shadowAngle) * (shadowLength / 2) + (frontSetback - rearSetback) / 2,
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[buildableWidth, shadowLength]} />
          <meshBasicMaterial color="#1e293b" opacity={0.6} transparent />
        </mesh>
      )}

      {/* Sun indicator sphere */}
      {sunPosition.altitude > 0 && (
        <mesh position={[sunX, sunY, sunZ]}>
          <sphereGeometry args={[5, 16, 16]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      )}

      {/* Directional light from sun */}
      <directionalLight
        position={[sunX, sunY, sunZ]}
        intensity={sunPosition.altitude > 0 ? 1.5 : 0.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-lotWidth}
        shadow-camera-right={lotWidth}
        shadow-camera-top={lotDepth}
        shadow-camera-bottom={-lotDepth}
      />

      {/* Ambient light */}
      <ambientLight intensity={sunPosition.altitude > 0 ? 0.4 : 0.2} />

      {/* Ground grid */}
      <Grid
        args={[lotWidth * 1.5, lotDepth * 1.5]}
        cellSize={10}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={50}
        sectionThickness={1}
        sectionColor="#9ca3af"
        fadeDistance={200}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />
    </group>
  );
}

export default function SunShadowAnalysis({
  dimensions,
  lotWidth = 100,
  lotDepth = 150,
  latitude = 28.3922, // Brevard County, FL
  longitude = -80.6077,
}: SunShadowAnalysisProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeOfDay, setTimeOfDay] = useState<number>(12); // Hour of day (0-23)
  const [season, setSeason] = useState<string>('current');

  // Calculate sun position based on date and time
  const sunPosition = useMemo(() => {
    let date = new Date(selectedDate);

    // Adjust date based on season selection
    if (season === 'summer') {
      date = new Date(date.getFullYear(), 5, 21); // June 21 (summer solstice)
    } else if (season === 'winter') {
      date = new Date(date.getFullYear(), 11, 21); // December 21 (winter solstice)
    } else if (season === 'spring') {
      date = new Date(date.getFullYear(), 2, 20); // March 20 (spring equinox)
    } else if (season === 'fall') {
      date = new Date(date.getFullYear(), 8, 22); // September 22 (fall equinox)
    }

    // Set time of day
    date.setHours(timeOfDay, 0, 0, 0);

    const position = SunCalc.getPosition(date, latitude, longitude);
    return {
      altitude: position.altitude,
      azimuth: position.azimuth,
    };
  }, [selectedDate, timeOfDay, season, latitude, longitude]);

  // Calculate sun metrics
  const sunAltitudeDeg = ((sunPosition.altitude * 180) / Math.PI).toFixed(1);
  const sunAzimuthDeg = ((sunPosition.azimuth * 180) / Math.PI).toFixed(1);
  const isDay = sunPosition.altitude > 0;

  // Get sun times for the selected date
  const sunTimes = useMemo(() => {
    let date = new Date(selectedDate);
    if (season === 'summer') {
      date = new Date(date.getFullYear(), 5, 21);
    } else if (season === 'winter') {
      date = new Date(date.getFullYear(), 11, 21);
    } else if (season === 'spring') {
      date = new Date(date.getFullYear(), 2, 20);
    } else if (season === 'fall') {
      date = new Date(date.getFullYear(), 8, 22);
    }
    return SunCalc.getTimes(date, latitude, longitude);
  }, [selectedDate, season, latitude, longitude]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isDay ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-400" />}
            Sun Position Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Season selector */}
          <div className="space-y-2">
            <Label>Season</Label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Date</SelectItem>
                <SelectItem value="summer">Summer Solstice (June 21)</SelectItem>
                <SelectItem value="winter">Winter Solstice (Dec 21)</SelectItem>
                <SelectItem value="spring">Spring Equinox (Mar 20)</SelectItem>
                <SelectItem value="fall">Fall Equinox (Sep 22)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time of day slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Time of Day</Label>
              <span className="text-sm font-medium">
                {timeOfDay === 0 ? '12:00 AM' : timeOfDay < 12 ? `${timeOfDay}:00 AM` : timeOfDay === 12 ? '12:00 PM' : `${timeOfDay - 12}:00 PM`}
              </span>
            </div>
            <Slider value={[timeOfDay]} onValueChange={(v) => setTimeOfDay(v[0])} min={0} max={23} step={1} />
          </div>

          {/* Sun metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Altitude</p>
              <p className="text-lg font-semibold">{sunAltitudeDeg}°</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Azimuth</p>
              <p className="text-lg font-semibold">{sunAzimuthDeg}°</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sunrise</p>
              <p className="text-sm font-medium">{formatTime(sunTimes.sunrise)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sunset</p>
              <p className="text-sm font-medium">{formatTime(sunTimes.sunset)}</p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`h-2 w-2 rounded-full ${isDay ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
            <span className="text-muted-foreground">{isDay ? 'Sun is above horizon' : 'Sun is below horizon'}</span>
          </div>
        </CardContent>
      </Card>

      {/* 3D Visualization */}
      <div className="relative w-full h-[500px] bg-slate-900 rounded-lg overflow-hidden">
        <Canvas camera={{ position: [80, 60, 80], fov: 50 }} shadows>
          <Scene dimensions={dimensions} lotWidth={lotWidth} lotDepth={lotDepth} sunPosition={sunPosition} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minPolarAngle={0} maxPolarAngle={Math.PI / 2} minDistance={50} maxDistance={300} />
        </Canvas>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur rounded-lg p-4 text-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 opacity-70 rounded"></div>
            <span>Building Envelope</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-800 opacity-60 rounded"></div>
            <span>Shadow Projection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
            <span>Sun Position</span>
          </div>
        </div>

        {/* Controls hint */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur rounded-lg p-3 text-xs text-muted-foreground">
          <p>🖱️ Drag to rotate</p>
          <p>🔍 Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
}
