import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export const ParallaxBackground = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  const spheres = Array.from({ length: 20 }, (_, i) => (
    <Sphere
      key={i}
      position={[
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20 - 10
      ]}
      args={[Math.random() * 0.5 + 0.1]}
    >
      <meshStandardMaterial
        color={`hsl(${Math.random() * 60 + 200}, 70%, ${Math.random() * 20 + 60}%)`}
        transparent
        opacity={0.3}
      />
    </Sphere>
  ));

  return (
    <group ref={groupRef}>
      {spheres}
    </group>
  );
};