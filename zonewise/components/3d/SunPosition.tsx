import { useEffect, useRef } from "react";
import { DirectionalLight } from "three";
import SunCalc from "suncalc";

interface SunPositionProps {
  date: Date;
  latitude: number;
  longitude: number;
  intensity?: number;
}

/**
 * Calculates sun position and creates directional light for shadows
 * Uses SunCalc library for accurate astronomical calculations
 */
export function SunPosition({
  date,
  latitude,
  longitude,
  intensity = 1.2,
}: SunPositionProps) {
  const lightRef = useRef<DirectionalLight>(null);

  useEffect(() => {
    if (!lightRef.current) return;

    // Calculate sun position using SunCalc
    const sunPos = SunCalc.getPosition(date, latitude, longitude);
    
    // Convert to Three.js coordinates
    // SunCalc returns azimuth (0 = south, positive = west) and altitude
    const distance = 100;
    const x = distance * Math.cos(sunPos.altitude) * Math.sin(sunPos.azimuth);
    const y = distance * Math.sin(sunPos.altitude);
    const z = distance * Math.cos(sunPos.altitude) * Math.cos(sunPos.azimuth);

    lightRef.current.position.set(x, y, z);
    lightRef.current.target.position.set(0, 0, 0);
    lightRef.current.target.updateMatrixWorld();

    // Adjust intensity based on sun altitude (dimmer at sunrise/sunset)
    const altitudeFactor = Math.max(0, Math.sin(sunPos.altitude));
    lightRef.current.intensity = intensity * altitudeFactor;
  }, [date, latitude, longitude, intensity]);

  return (
    <>
      <directionalLight
        ref={lightRef}
        color="#fcd34d"
        intensity={intensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      {/* Visual sun sphere */}
      <mesh position={lightRef.current?.position || [50, 50, 50]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#fcd34d" />
      </mesh>
    </>
  );
}
