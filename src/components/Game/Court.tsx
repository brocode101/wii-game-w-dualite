import React from 'react';
import { Text } from '@react-three/drei';

export const Court: React.FC = () => {
  return (
    <group>
      {/* --- STADIUM ENVIRONMENT --- */}
      
      {/* Floor (Darker outside court) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#1e40af" /> {/* Deep Blue Stadium Floor */}
      </mesh>

      {/* Walls/Stands */}
      <group>
          {/* Back Wall Player */}
          <mesh position={[0, 5, 25]}>
            <boxGeometry args={[50, 10, 2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Back Wall Opponent */}
          <mesh position={[0, 5, -25]}>
            <boxGeometry args={[50, 10, 2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Side Walls */}
          <mesh position={[20, 5, 0]}>
            <boxGeometry args={[2, 10, 60]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[-20, 5, 0]}>
            <boxGeometry args={[2, 10, 60]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          
          {/* Crowd/Lights Placeholder (Emissive Strips) */}
          <mesh position={[0, 8, -24]}>
             <boxGeometry args={[40, 0.5, 0.5]} />
             <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0, 8, 24]}>
             <boxGeometry args={[40, 0.5, 0.5]} />
             <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
          </mesh>
      </group>

      {/* --- TENNIS COURT --- */}
      
      {/* Main Court Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[11, 23.7]} /> {/* Standard-ish dimensions */}
        <meshStandardMaterial color="#3b82f6" roughness={0.8} /> {/* Hard Court Blue */}
      </mesh>

      {/* Inner Court (Play Area) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[8.23, 23.7]} />
        <meshStandardMaterial color="#60a5fa" roughness={0.8} /> {/* Lighter Blue */}
      </mesh>
      
      {/* Lines Group */}
      <group position={[0, 0.02, 0]}>
          {/* Material for all lines */}
          <meshBasicMaterial color="white" />
          
          {/* Baselines */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 11.89]}>
            <planeGeometry args={[10.97, 0.15]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -11.89]}>
            <planeGeometry args={[10.97, 0.15]} />
            <meshBasicMaterial color="white" />
          </mesh>
          
          {/* Sidelines (Singles) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.115, 0, 0]}>
            <planeGeometry args={[0.15, 23.77]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.115, 0, 0]}>
            <planeGeometry args={[0.15, 23.77]} />
            <meshBasicMaterial color="white" />
          </mesh>

          {/* Service Line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 6.4]}>
            <planeGeometry args={[8.23, 0.15]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6.4]}>
            <planeGeometry args={[8.23, 0.15]} />
            <meshBasicMaterial color="white" />
          </mesh>
          
          {/* Center Line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[0.15, 12.8]} />
            <meshBasicMaterial color="white" />
          </mesh>
      </group>

      {/* Net */}
      <group position={[0, 0, 0]}>
          {/* Net Mesh */}
          <mesh position={[0, 0.53, 0]}>
            <boxGeometry args={[12, 1.07, 0.02]} />
            <meshStandardMaterial color="#e2e8f0" opacity={0.6} transparent map={null} />
          </mesh>
          {/* Top Tape */}
          <mesh position={[0, 1.07, 0]}>
             <boxGeometry args={[12, 0.1, 0.05]} />
             <meshStandardMaterial color="white" />
          </mesh>
          {/* Posts */}
          <mesh position={[6, 0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[-6, 0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          
          {/* Dualite Branding on Net */}
          <Text 
            position={[0, 0.5, 0.05]} 
            fontSize={0.4} 
            color="white" 
            anchorX="center" 
            anchorY="middle" 
            opacity={0.5}
          >
            DUALITE OPEN
          </Text>
      </group>
    </group>
  );
};
