import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { soundEngine } from '../../utils/SoundEngine';
import * as THREE from 'three';

// Physics Constants - RESTORED SNAPPIER FEEL
const GRAVITY = 0.02; // Increased gravity (was 0.012) for heavier feel
const BOUNCE_DAMPING = 0.75; 
const NET_HEIGHT = 1.0; 

export const Ball: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Physics State
  const position = useRef(new THREE.Vector3(0, 1, 10)); 
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const lastHitter = useRef<'player' | 'opponent' | 'none'>('none');
  
  const { gameState, setGameState, addScore, playerPositionX, isSwinging, swingType } = useGameStore();

  // Helper to calculate velocity to land safely in opponent's court
  const calculateSafeShot = (fromPos: THREE.Vector3, targetZ: number, flightTime: number) => {
      // Pick a random safe X coordinate on the target side
      const targetX = (Math.random() - 0.5) * 5; // Wider target area
      
      const vx = (targetX - fromPos.x) / flightTime;
      const vz = (targetZ - fromPos.z) / flightTime;
      
      // Calculate required vertical velocity to land at y=0
      // dy = vy * t - 0.5 * g * t^2
      // 0 - fromPos.y = vy * t - 0.5 * g * t^2
      // vy = (0.5 * g * t^2 - fromPos.y) / t
      const vy = (0.5 * GRAVITY * Math.pow(flightTime, 2) - fromPos.y) / flightTime;
      
      return new THREE.Vector3(vx, Math.abs(vy), vz);
  };

  const resetBall = (server: 'player' | 'opponent') => {
    velocity.current.set(0, 0, 0);
    lastHitter.current = 'none';
    
    if (server === 'player') {
        const startX = isNaN(playerPositionX) ? 0 : playerPositionX * 4;
        position.current.set(startX, 1.5, 10);
    } else {
        position.current.set(0, 1.5, -10);
        // AI Serve
        setTimeout(() => {
             if (gameState === 'SERVING') { 
                 // Faster AI Serve
                 velocity.current.set((Math.random() - 0.5) * 0.05, 0.3, 0.6); 
                 lastHitter.current = 'opponent';
                 soundEngine.playHit(true);
                 setGameState('RALLY');
             }
        }, 1000);
    }
  };

  useEffect(() => {
    if (gameState === 'SERVING') {
        resetBall('player');
    } else if (gameState === 'POINT_END') {
        const timer = setTimeout(() => {
            setGameState('SERVING');
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [gameState]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    // --- PHYSICS LOOP ---
    if (gameState === 'RALLY' || gameState === 'SERVING') {
        // 1. Gravity
        if (position.current.y > 0.1) {
            velocity.current.y -= GRAVITY;
        }

        // 2. Movement
        position.current.add(velocity.current);

        // 3. Floor Bounce
        if (position.current.y <= 0.1) {
            position.current.y = 0.1;
            
            if (Math.abs(velocity.current.y) > 0.1) {
                velocity.current.y *= -BOUNCE_DAMPING;
                soundEngine.playBounce();
            } else {
                velocity.current.y = 0; 
            }
            
            velocity.current.x *= 0.96; // Friction
            velocity.current.z *= 0.96;
        } else {
            // Air Resistance (Less resistance for faster ball)
            velocity.current.x *= 0.998;
            velocity.current.z *= 0.998;
        }
        
        // 4. Net Collision
        if (Math.abs(position.current.z) < 0.2 && position.current.y < NET_HEIGHT) {
             velocity.current.z *= -0.3; 
             velocity.current.x *= 0.5;
             soundEngine.playBounce();
        }
    }

    // --- PLAYER INTERACTION ---
    const playerPos = new THREE.Vector3(playerPositionX * 4, 1, 11);
    const distToPlayer = position.current.distanceTo(playerPos);
    
    if (gameState === 'SERVING' && isSwinging && distToPlayer < 3.5) {
        // SERVE
        setGameState('RALLY');
        lastHitter.current = 'player';
        
        // Faster Serve (Flight time 35 frames instead of 50)
        const targetZ = -9; 
        const flightTime = 35; 
        
        velocity.current = calculateSafeShot(position.current, targetZ, flightTime);
        soundEngine.playHit(true);
    } 
    else if (gameState === 'RALLY' && isSwinging && lastHitter.current !== 'player') {
        // RETURN
        if (position.current.z > 8 && position.current.z < 14 && Math.abs(position.current.x - playerPos.x) < 3.0) {
            lastHitter.current = 'player';
            
            // Faster Return (Flight time 45 frames instead of 60)
            const targetZ = -11; 
            const flightTime = 45; 
            
            velocity.current = calculateSafeShot(position.current, targetZ, flightTime);
            
            // Curve
            if (swingType === 'backhand') velocity.current.x += 0.08;
            else velocity.current.x -= 0.08;

            soundEngine.playHit(false);
        }
    }

    // --- AI INTERACTION ---
    if (gameState === 'RALLY' && lastHitter.current !== 'opponent') {
        if (position.current.z < -9 && position.current.z > -13 && velocity.current.z < 0) {
            lastHitter.current = 'opponent';
            
            // Faster AI Return
            const targetZ = 10;
            const flightTime = 50; 
            
            velocity.current = calculateSafeShot(position.current, targetZ, flightTime);
            soundEngine.playHit(false);
        }
    }

    // --- SCORING ---
    if (Math.abs(position.current.z) > 15 || Math.abs(position.current.x) > 7) {
        if (gameState === 'RALLY') {
            if (position.current.z > 0) {
                addScore('opponent'); 
                soundEngine.playScore(false);
            } else {
                addScore('player'); 
                soundEngine.playScore(true);
            }
        }
    }
    
    // Dead Ball (Stricter check for stuck balls)
    if (gameState === 'RALLY' && velocity.current.lengthSq() < 0.005) {
        if (position.current.z > 0) {
            addScore('opponent');
            soundEngine.playScore(false);
        } else {
            addScore('player');
            soundEngine.playScore(true);
        }
    }

    meshRef.current.position.copy(position.current);
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <sphereGeometry args={[0.15, 32, 32]} />
      <meshStandardMaterial color="#bef264" emissive="#bef264" emissiveIntensity={0.2} /> 
    </mesh>
  );
};
