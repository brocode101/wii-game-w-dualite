import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Stars, Text, Float } from '@react-three/drei';
import { Court } from './Court';
import { PlayerAvatar } from './Characters';
import { Ball } from './Ball';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

const GameContent = () => {
    const { playerPositionX, isSwinging, swingType, gameState, message } = useGameStore();
    
    // Simple AI Movement Logic
    // We can't easily read ball position from here without refactoring, 
    // but we can fake it or just center it.
    // For now, let's make the AI follow the player's X slightly inverted to look like they are covering angles
    // Or better, just center them for stability as requested.
    const aiPositionX = useRef(0);
    
    useFrame((state) => {
        // Subtle AI idle movement
        aiPositionX.current = Math.sin(state.clock.elapsedTime * 0.5) * 1.5;
    });

    return (
        <>
            {/* --- LIGHTING --- */}
            <ambientLight intensity={0.6} />
            <spotLight 
                position={[10, 20, 10]} 
                angle={0.4} 
                penumbra={1} 
                intensity={1.5} 
                castShadow 
                shadow-mapSize={[2048, 2048]} 
            />
            <pointLight position={[-10, 10, -10]} intensity={0.5} color="#00ffff" />
            
            {/* --- ENVIRONMENT --- */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Environment preset="city" /> 

            <Court />
            
            {/* --- PLAYERS --- */}
            <PlayerAvatar 
                position={[playerPositionX * 4, 0, 11]} 
                isSwinging={isSwinging} 
                swingType={swingType}
                color="#3b82f6" 
            />

            <PlayerAvatar 
                position={[aiPositionX.current, 0, -11]} 
                isSwinging={false} 
                swingType="none"
                color="#ef4444" 
                isOpponent={true}
            />

            <Ball />
            
            {/* --- UI IN 3D SPACE --- */}
            {(gameState === 'MENU' || gameState === 'POINT_END' || gameState === 'GAME_OVER') && (
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Text 
                        position={[0, 3, 5]} 
                        fontSize={1.5} 
                        color="#fbbf24" 
                        anchorX="center" 
                        anchorY="middle"
                        outlineWidth={0.05}
                        outlineColor="#78350f"
                    >
                        {message}
                    </Text>
                </Float>
            )}
        </>
    );
};

export const GameScene: React.FC = () => {
  return (
    <div className="w-full h-full bg-slate-900">
      <Canvas shadows camera={{ position: [0, 8, 18], fov: 45 }}>
        <Suspense fallback={null}>
            <GameContent />
        </Suspense>
        <fog attach="fog" args={['#1e1b4b', 10, 50]} /> 
      </Canvas>
    </div>
  );
};
