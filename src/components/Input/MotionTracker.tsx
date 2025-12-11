import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { useGameStore } from '../../store/gameStore';

const VIDEO_WIDTH = 320;
const VIDEO_HEIGHT = 240;

// Smoothing factor (Lower = smoother but more lag, Higher = responsive but jittery)
const SMOOTHING = 0.15; 

export const MotionTracker: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const updateMotion = useGameStore((state) => state.updateMotion);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for smoothing
  const smoothedX = useRef<number>(0);
  const prevWristX = useRef<number>(0);
  const lastSwingTime = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const isMounted = useRef<boolean>(true);

  // Helper to draw skeleton
  const drawSkeleton = (keypoints: poseDetection.Keypoint[], ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    
    // Draw connections
    const adjacentPairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    
    adjacentPairs.forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];
        if(kp1.score && kp1.score > 0.3 && kp2.score && kp2.score > 0.3) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.stroke();
        }
    });

    // Draw points
    keypoints.forEach((kp) => {
        if(kp.score && kp.score > 0.3) {
            ctx.fillStyle = kp.name?.includes('wrist') ? '#ff0000' : '#00ff00';
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
  };

  useEffect(() => {
    isMounted.current = true;

    const runPoseDetection = async () => {
      await tf.ready();
      await tf.setBackend('webgl');
      
      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
      
      if (!isMounted.current) return;
      setIsLoading(false);

      const detect = async () => {
        if (!isMounted.current) return;

        if (
          webcamRef.current &&
          webcamRef.current.video &&
          webcamRef.current.video.readyState === 4
        ) {
          const video = webcamRef.current.video;
          
          try {
            const poses = await detector.estimatePoses(video);

            if (poses.length > 0) {
                const keypoints = poses[0].keypoints;
                
                // Draw debug overlay
                if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    if (ctx) drawSkeleton(keypoints, ctx);
                }

                // 1. Calculate Player Position (Smoothed)
                const nose = keypoints.find((k) => k.name === 'nose');
                let targetX = 0;
                
                if (nose) {
                    // Normalize to -1 to 1
                    // Camera is mirrored in CSS, but coordinates are raw.
                    // Raw X: 0 (Left of frame) -> Width (Right of frame)
                    // We want: Moving User's Right (Screen Left) -> Game Right
                    const rawNorm = (nose.x / VIDEO_WIDTH) * 2 - 1; // -1 to 1
                    targetX = -rawNorm; // Invert because webcam is mirrored
                }

                // Apply Smoothing (Linear Interpolation)
                smoothedX.current = smoothedX.current + (targetX - smoothedX.current) * SMOOTHING;

                // 2. Detect Swings
                const rightWrist = keypoints.find((k) => k.name === 'right_wrist');
                let isSwinging = false;
                let swingType: 'forehand' | 'backhand' | 'none' = 'none';

                if (rightWrist && rightWrist.score && rightWrist.score > 0.3) {
                    const currentX = rightWrist.x;
                    const velocity = currentX - prevWristX.current;
                    const currentTime = Date.now();

                    // Thresholds
                    const VELOCITY_THRESHOLD = 12;
                    const COOLDOWN = 400;

                    if (Math.abs(velocity) > VELOCITY_THRESHOLD && (currentTime - lastSwingTime.current > COOLDOWN)) {
                        isSwinging = true;
                        lastSwingTime.current = currentTime;
                        
                        // Swing Direction Logic
                        // If velocity is negative, wrist is moving Left (in raw video coords)
                        // Since video is mirrored:
                        // Moving Hand Right (Real World) -> Moves Left on Screen (Raw Coords) -> Forehand (for righty)
                        if (velocity < 0) {
                            swingType = 'forehand'; 
                        } else {
                            swingType = 'backhand';
                        }
                    }
                    prevWristX.current = currentX;
                }

                updateMotion(smoothedX.current, isSwinging, swingType);
            }
          } catch (err) {
            console.warn("Pose detection error:", err);
          }
        }
        
        requestRef.current = requestAnimationFrame(detect);
      };

      detect();
    };

    runPoseDetection();

    return () => {
        isMounted.current = false;
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
    };
  }, [updateMotion]);

  return (
    <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white/30 bg-black w-full h-full group">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white z-20">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-xs font-bold tracking-wider">INITIALIZING AI...</p>
          </div>
        </div>
      )}
      
      {/* Video Feed */}
      <Webcam
        ref={webcamRef}
        mirrored={true}
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        videoConstraints={{
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
            facingMode: "user"
        }}
      />
      
      {/* Debug Overlay (Skeleton) */}
      <canvas 
        ref={canvasRef}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" // Mirror canvas to match mirrored video
      />

      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-green-400 font-mono border border-green-500/30">
        ● LIVE TRACKING
      </div>
    </div>
  );
};
