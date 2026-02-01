import { Line } from "@react-three/drei";

/**
 * Visualizes setback lines and lot boundaries
 */

interface SetbackVisualizationProps {
  lotWidth: number;
  lotDepth: number;
  setbacks: {
    front: number;
    side: number;
    rear: number;
  };
}

export function SetbackVisualization({
  lotWidth,
  lotDepth,
  setbacks,
}: SetbackVisualizationProps) {
  // Calculate setback line positions
  const frontLine = -lotDepth / 2 + setbacks.front;
  const rearLine = lotDepth / 2 - setbacks.rear;
  const leftLine = -lotWidth / 2 + setbacks.side;
  const rightLine = lotWidth / 2 - setbacks.side;

  return (
    <group>
      {/* Lot boundary - white outline */}
      <Line
        points={[
          [-lotWidth / 2, 0.05, -lotDepth / 2],
          [lotWidth / 2, 0.05, -lotDepth / 2],
          [lotWidth / 2, 0.05, lotDepth / 2],
          [-lotWidth / 2, 0.05, lotDepth / 2],
          [-lotWidth / 2, 0.05, -lotDepth / 2],
        ]}
        color="#ffffff"
        lineWidth={2}
      />

      {/* Front setback line */}
      <Line
        points={[
          [-lotWidth / 2, 0.1, frontLine],
          [lotWidth / 2, 0.1, frontLine],
        ]}
        color="#ef4444"
        lineWidth={2}
      />

      {/* Rear setback line */}
      <Line
        points={[
          [-lotWidth / 2, 0.1, rearLine],
          [lotWidth / 2, 0.1, rearLine],
        ]}
        color="#ef4444"
        lineWidth={2}
      />

      {/* Left setback line */}
      <Line
        points={[
          [leftLine, 0.1, -lotDepth / 2],
          [leftLine, 0.1, lotDepth / 2],
        ]}
        color="#ef4444"
        lineWidth={2}
      />

      {/* Right setback line */}
      <Line
        points={[
          [rightLine, 0.1, -lotDepth / 2],
          [rightLine, 0.1, lotDepth / 2],
        ]}
        color="#ef4444"
        lineWidth={2}
      />

      {/* Setback zone planes (semi-transparent red) */}
      {/* Front setback zone */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, (-lotDepth / 2 + setbacks.front / 2)]}
      >
        <planeGeometry args={[lotWidth, setbacks.front]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.1}
          side={2}
        />
      </mesh>

      {/* Rear setback zone */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, (lotDepth / 2 - setbacks.rear / 2)]}
      >
        <planeGeometry args={[lotWidth, setbacks.rear]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.1}
          side={2}
        />
      </mesh>

      {/* Left setback zone */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[(-lotWidth / 2 + setbacks.side / 2), 0.05, 0]}
      >
        <planeGeometry args={[setbacks.side, lotDepth]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.1}
          side={2}
        />
      </mesh>

      {/* Right setback zone */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[(lotWidth / 2 - setbacks.side / 2), 0.05, 0]}
      >
        <planeGeometry args={[setbacks.side, lotDepth]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.1}
          side={2}
        />
      </mesh>
    </group>
  );
}
