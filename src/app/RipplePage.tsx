import React, { FC, Suspense, useEffect, useRef, useState } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Effect } from "./Effect";
import { ImagePlane } from "./ImagePlane";

const RipplePage: FC = () => {
  const [aspect, setAspect] = useState(1);
  const [dpr, setDpr] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAspect(window.innerWidth / window.innerHeight);
      setDpr(window.devicePixelRatio);
    }
  }, []);

  return (
    <Canvas dpr={dpr} ref={canvasRef}> {/* ← ref 設定 */}
      <color attach="background" args={['#000']} />
      <Suspense fallback={null}>
        <ImagePlane />
      </Suspense>
      <PerspectiveCamera
        position={[0, 0, 2]}
        fov={50}
        aspect={aspect}
        near={0.1}
        far={2000}
      />
      <Effect canvasRef={canvasRef} /> {/* ← 渡す */}
    </Canvas>
  );
};

export default RipplePage;
