"use client"
import React, {FC, useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {Plane, useTexture} from '@react-three/drei';
import {useFrame} from '@react-three/fiber';

export const ImagePlane: FC = () => {
  const textures = useTexture([
    "/pic/akasi.jpg",
    "/pic/gyoen.jpg",
    "/pic/asakusa.jpg",
    "/pic/enoshima.jpg",
    "/pic/nagoya.jpg",
    "/pic/shinjuku.jpg",
    "/pic/akasi.jpg",
    "/pic/gyoen.jpg",
    "/pic/asakusa.jpg"
  ]);



  const [columns, setColumns] = useState(3); // 列数の初期設定
  const fixedAspectRatio = 18 / 9; // アスペクト比
  const fixedWidth = 1.6; // 画像の固定幅
  const fixedHeight = fixedWidth / fixedAspectRatio; // 画像の高さ

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width > 1250) {
        setColumns(3);
      } else if (width > 820) {
        setColumns(2);
      } else {
        setColumns(1); 
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const material = (texture: THREE.Texture) =>
    new THREE.ShaderMaterial({
      uniforms: {
        u_texture: { value: texture },
        u_aspectRatio: { value: texture.image.width / texture.image.height },
        u_targetAspectRatio: { value: fixedAspectRatio },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });


  return (
    <group position={[0, 2.0, 0]} >
      {textures.map((texture, i) => {
        const xOffset = ((i % columns) - (columns - 1) / 2) * 3.3; 
        const yOffset = -Math.floor(i / columns) * 1.7; 

        return (
          <mesh
            key={i}
            position={[xOffset, yOffset, 0]}
          >
            <Plane args={[fixedWidth * 2, fixedHeight * 2]}>
              <primitive attach="material" object={material(texture)} />
            </Plane>
          </mesh>
        );
      })}
    </group>
  );
};

const vertexShader = `
varying vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragmentShader = `
uniform sampler2D u_texture;
uniform float u_aspectRatio;
uniform float u_targetAspectRatio;
varying vec2 v_uv;

void main() {
  vec2 uv = v_uv;

  if (u_aspectRatio > u_targetAspectRatio) {
    float scale = u_targetAspectRatio / u_aspectRatio;
    uv.x = uv.x * scale + (1.0 - scale) / 2.0;
  } else {
    float scale = u_aspectRatio / u_targetAspectRatio;
    uv.y = uv.y * scale + (1.0 - scale) / 2.0;
  }

  vec4 color = texture2D(u_texture, uv);
  gl_FragColor = color;
}
`;
