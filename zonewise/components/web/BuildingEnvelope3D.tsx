import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

interface BuildingEnvelopeProps {
  dimensions?: {
    front_setback?: string;
    rear_setback?: string;
    side_setback?: string;
    max_height?: string;
    max_lot_coverage?: string;
    min_lot_size?: string;
  };
  lotWidth?: number;
  lotDepth?: number;
}

function parseNumeric(value?: string): number | null {
  if (!value) return null;
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function BuildingMesh({ dimensions, lotWidth = 100, lotDepth = 150 }: BuildingEnvelopeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Parse dimensional standards
  const frontSetback = parseNumeric(dimensions?.front_setback) || 25;
  const rearSetback = parseNumeric(dimensions?.rear_setback) || 20;
  const sideSetback = parseNumeric(dimensions?.side_setback) || 10;
  const maxHeight = parseNumeric(dimensions?.max_height) || 35;
  
  // Calculate buildable area
  const buildableWidth = lotWidth - (sideSetback * 2);
  const buildableDepth = lotDepth - frontSetback - rearSetback;
  const buildableHeight = maxHeight;

  // Subtle rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group>
      {/* Lot boundary */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[lotWidth, 0.1, lotDepth]} />
        <meshStandardMaterial color="#10b981" opacity={0.2} transparent />
      </mesh>
      
      {/* Lot outline */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(lotWidth, 0.1, lotDepth)]} />
        <lineBasicMaterial attach="material" color="#10b981" linewidth={2} />
      </lineSegments>

      {/* Buildable envelope */}
      <mesh
        ref={meshRef}
        position={[0, buildableHeight / 2, (frontSetback - rearSetback) / 2]}
      >
        <boxGeometry args={[buildableWidth, buildableHeight, buildableDepth]} />
        <meshStandardMaterial
          color="#3b82f6"
          opacity={0.6}
          transparent
          wireframe={false}
        />
      </mesh>

      {/* Buildable envelope wireframe */}
      <mesh position={[0, buildableHeight / 2, (frontSetback - rearSetback) / 2]}>
        <boxGeometry args={[buildableWidth, buildableHeight, buildableDepth]} />
        <meshStandardMaterial
          color="#1d4ed8"
          opacity={0.8}
          transparent
          wireframe
        />
      </mesh>

      {/* Setback indicators (simplified) */}
      <group>
        {/* Front setback plane */}
        <mesh position={[0, 0.1, lotDepth / 2 - frontSetback]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[lotWidth, 0.5]} />
          <meshBasicMaterial color="#ef4444" opacity={0.5} transparent />
        </mesh>
        
        {/* Rear setback plane */}
        <mesh position={[0, 0.1, -lotDepth / 2 + rearSetback]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[lotWidth, 0.5]} />
          <meshBasicMaterial color="#ef4444" opacity={0.5} transparent />
        </mesh>
        
        {/* Left side setback plane */}
        <mesh position={[-lotWidth / 2 + sideSetback, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, lotDepth]} />
          <meshBasicMaterial color="#ef4444" opacity={0.5} transparent />
        </mesh>
        
        {/* Right side setback plane */}
        <mesh position={[lotWidth / 2 - sideSetback, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, lotDepth]} />
          <meshBasicMaterial color="#ef4444" opacity={0.5} transparent />
        </mesh>
      </group>
      
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

export default function BuildingEnvelope3D({
  dimensions,
  lotWidth = 100,
  lotDepth = 150,
}: BuildingEnvelopeProps) {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-slate-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{
          position: [80, 60, 80],
          fov: 50,
        }}
        shadows
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-50, 50, -25]} intensity={0.5} />

        {/* 3D Content */}
        <BuildingMesh
          dimensions={dimensions}
          lotWidth={lotWidth}
          lotDepth={lotDepth}
        />

        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          minDistance={50}
          maxDistance={300}
        />
      </Canvas>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur rounded-lg p-4 text-sm space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 opacity-60 rounded"></div>
          <span>Buildable Envelope</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-red-500"></div>
          <span>Setback Lines</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 opacity-20 rounded"></div>
          <span>Lot Boundary</span>
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur rounded-lg p-3 text-xs text-muted-foreground">
        <p>🖱️ Drag to rotate</p>
        <p>🔍 Scroll to zoom</p>
        <p>⌨️ Right-click to pan</p>
      </div>
    </div>
  );
}
