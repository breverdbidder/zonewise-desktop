import { useRef } from "react";
import { Mesh } from "three";
import * as THREE from "three";

interface EnvelopeGeometryProps {
  width: number;
  depth: number;
  height: number;
  position?: [number, number, number];
  castShadow?: boolean;
}

/**
 * 3D mesh representing the buildable envelope
 * Shows the maximum volume that can be built within setback constraints
 */
export function EnvelopeGeometry({
  width,
  depth,
  height,
  position = [0, 0, 0],
  castShadow = true,
}: EnvelopeGeometryProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <group position={position}>
      {/* Main buildable envelope */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        castShadow={castShadow}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.3}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Wireframe outline */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial
          color="#60a5fa"
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Ground footprint */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.2}
        />
      </mesh>


    </group>
  );
}
