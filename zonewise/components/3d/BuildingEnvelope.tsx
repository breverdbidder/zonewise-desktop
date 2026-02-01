import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei";
import { EnvelopeGeometry } from "./EnvelopeGeometry";
import { SetbackVisualization } from "./SetbackVisualization";
import { SunPosition } from "./SunPosition";
import type { ZoningDimensions } from "../../types/zoning";

interface BuildingEnvelopeProps {
  dimensions: ZoningDimensions;
  lotWidth: number;
  lotDepth: number;
  date?: Date;
  showShadows?: boolean;
  showSetbacks?: boolean;
  showGrid?: boolean;
}

/**
 * Main 3D building envelope visualization component
 * Renders a WebGL scene with the buildable envelope, setbacks, and sun/shadow analysis
 */
export function BuildingEnvelope({
  dimensions,
  lotWidth,
  lotDepth,
  date = new Date(),
  showShadows = true,
  showSetbacks = true,
  showGrid = true,
}: BuildingEnvelopeProps) {
  const maxHeight = dimensions.max_height_ft || 35;
  const setbacks = dimensions.setbacks_ft || {
    front: 25,
    side: 10,
    rear: 20,
  };

  // Calculate buildable dimensions
  const buildableWidth = lotWidth - (setbacks.side * 2);
  const buildableDepth = lotDepth - (setbacks.front + setbacks.rear);

  return (
    <div className="w-full h-full relative bg-slate-900">
      <Canvas
        shadows={showShadows}
        className="w-full h-full"
        gl={{ antialias: true, alpha: false }}
      >
        {/* Camera */}
        <PerspectiveCamera
          makeDefault
          position={[lotWidth * 1.5, maxHeight * 1.5, lotDepth * 1.5]}
          fov={50}
        />

        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={500}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <hemisphereLight intensity={0.3} groundColor="#1e293b" />

        {/* Sun position and directional light */}
        {showShadows && (
          <SunPosition
            date={date}
            latitude={28.0836} // Brevard County approximate
            longitude={-80.6081}
            intensity={1.2}
          />
        )}

        {/* Grid helper */}
        {showGrid && (
          <Grid
            args={[Math.max(lotWidth, lotDepth) * 2, Math.max(lotWidth, lotDepth) * 2]}
            cellSize={5}
            cellThickness={0.5}
            cellColor="#374151"
            sectionSize={25}
            sectionThickness={1}
            sectionColor="#4b5563"
            fadeDistance={300}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid
          />
        )}

        {/* Building envelope */}
        <EnvelopeGeometry
          width={buildableWidth}
          depth={buildableDepth}
          height={maxHeight}
          position={[
            (setbacks.side - setbacks.side),
            0,
            (setbacks.front - setbacks.rear) / 2,
          ]}
          castShadow={showShadows}
        />

        {/* Setback visualization */}
        {showSetbacks && (
          <SetbackVisualization
            lotWidth={lotWidth}
            lotDepth={lotDepth}
            setbacks={setbacks}
          />
        )}

        {/* Ground plane for shadows */}
        {showShadows && (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            receiveShadow
          >
            <planeGeometry args={[lotWidth * 3, lotDepth * 3]} />
            <shadowMaterial opacity={0.3} />
          </mesh>
        )}
      </Canvas>

      {/* Overlay controls and info */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white p-4 rounded-lg text-sm space-y-2">
        <div>
          <span className="font-semibold">Lot:</span> {lotWidth}' × {lotDepth}'
        </div>
        <div>
          <span className="font-semibold">Buildable:</span> {buildableWidth.toFixed(1)}' × {buildableDepth.toFixed(1)}'
        </div>
        <div>
          <span className="font-semibold">Max Height:</span> {maxHeight}'
        </div>
        <div className="text-xs text-gray-300 mt-2">
          <div>Front Setback: {setbacks.front}'</div>
          <div>Side Setback: {setbacks.side}'</div>
          <div>Rear Setback: {setbacks.rear}'</div>
        </div>
      </div>
    </div>
  );
}
