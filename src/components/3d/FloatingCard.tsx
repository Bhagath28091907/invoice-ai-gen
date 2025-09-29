import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingCardProps {
  position: [number, number, number];
  title: string;
  value: string;
  color: string;
  rotation?: [number, number, number];
}

export const FloatingCard = ({ position, title, value, color, rotation = [0, 0, 0] }: FloatingCardProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = rotation[0] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
      meshRef.current.rotation.y = rotation[1] + Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.4) * 0.1;
    }
  });

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[2, 1.2, 0.1]}
        radius={0.1}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} transparent opacity={0.9} />
      </RoundedBox>
      
      <Text
        ref={textRef}
        position={[0, 0.2, 0.06]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>
      
      <Text
        position={[0, -0.2, 0.06]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
    </group>
  );
};