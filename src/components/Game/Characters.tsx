import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Color } from 'three';
import { Trail } from '@react-three/drei';

// Improved Character with Trails and better geometry
export const PlayerAvatar: React.FC<{ 
    position: [number, number, number], 
    isSwinging: boolean, 
    swingType: string, 
    color?: string,
    isOpponent?: boolean 
}> = ({ position, isSwinging, swingType, color = "#3b82f6", isOpponent = false }) => {
  const racketRef = useRef<any>(null);
  const bodyRef = useRef<any>(null);
  
  // Smooth body tilt based on movement
  const prevX = useRef(position[0]);
  
  useFrame((state) => {
    // Body Tilt Animation
    if (bodyRef.current) {
        const xDiff = position[0] - prevX.current;
        bodyRef.current.rotation.z = -xDiff * 2; // Lean into movement
        bodyRef.current.rotation.y = isOpponent ? Math.PI : 0; // Face correct way
        prevX.current = position[0];
    }

    // Racket Swing Animation
    if (racketRef.current) {
        if (isSwinging) {
            const speed = 15;
            const time = state.clock.elapsedTime;
            
            // Forehand vs Backhand Swing Arcs
            if (swingType === 'forehand') {
                 racketRef.current.rotation.y = -Math.PI / 2 + Math.sin(time * speed) * 2;
                 racketRef.current.position.x = 0.8;
            } else {
                 racketRef.current.rotation.y = Math.PI / 2 - Math.sin(time * speed) * 2;
                 racketRef.current.position.x = -0.8; // Move racket to left side for backhand
            }
            // Add some wrist snap
            racketRef.current.rotation.z = Math.cos(time * speed * 1.5);
        } else {
            // Idle Stance
            const idleTime = state.clock.elapsedTime * 2;
            racketRef.current.rotation.set(0.2, isOpponent ? -0.5 : 0.5, 0.5);
            racketRef.current.position.set(isOpponent ? -0.6 : 0.6, 0.5 + Math.sin(idleTime) * 0.05, 0.5);
        }
    }
  });

  const skinColor = "#fca5a5";
  const shirtColor = new Color(color);

  return (
    <group position={new Vector3(...position)}>
      {/* Floating Body Group */}
      <group ref={bodyRef}>
          {/* Torso */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <capsuleGeometry args={[0.35, 0.8, 4, 16]} />
            <meshStandardMaterial color={shirtColor} roughness={0.3} />
          </mesh>
          
          {/* Head */}
          <mesh position={[0, 1.65, 0]} castShadow>
            <sphereGeometry args={[0.32, 32, 32]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          
          {/* Simple Face (Visor/Eyes) */}
          <mesh position={[0, 1.7, 0.25]}>
             <boxGeometry args={[0.4, 0.1, 0.15]} />
             <meshStandardMaterial color="#333" />
          </mesh>

          {/* Floating Left Hand (Balance) */}
          <mesh position={[-0.6, 0.8, 0.2]}>
             <sphereGeometry args={[0.12]} />
             <meshStandardMaterial color="white" /> {/* Glove */}
          </mesh>
      </group>
      
      {/* Racket Hand Group (Independent for swings) */}
      <group ref={racketRef} position={[0.6, 0.5, 0.5]}>
         {/* Hand (Glove) */}
         <mesh castShadow>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color="white" />
         </mesh>
         
         {/* Racket Object */}
         <group rotation={[Math.PI/4, 0, 0]} position={[0, 0.2, 0]}>
             {/* Handle */}
             <mesh position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.025, 0.03, 0.6]} />
                <meshStandardMaterial color="#1e293b" />
             </mesh>
             
             {/* Frame */}
             <mesh position={[0, 0.9, 0]} castShadow>
                <torusGeometry args={[0.3, 0.03, 16, 32]} />
                <meshStandardMaterial color={isOpponent ? "#ef4444" : "#3b82f6"} metalness={0.5} />
             </mesh>
             
             {/* Strings */}
             <mesh position={[0, 0.9, 0]}>
                 <cylinderGeometry args={[0.29, 0.29, 0.01]} />
                 <meshBasicMaterial color="#ffff00" wireframe opacity={0.15} transparent />
             </mesh>

             {/* Swing Trail Effect */}
             {isSwinging && (
                 <Trail width={1.5} length={4} color={new Color(color).multiplyScalar(2)} decay={1} attenuation={(t) => t * t}>
                    <mesh visible={false}>
                        <sphereGeometry args={[0.1]} />
                    </mesh>
                 </Trail>
             )}
         </group>
      </group>
      
      {/* Shadow Blob */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color="black" opacity={0.3} transparent />
      </mesh>
    </group>
  );
};
