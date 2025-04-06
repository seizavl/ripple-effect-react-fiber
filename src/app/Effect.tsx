"use client"
import React, { FC, useEffect, useRef } from 'react';
import { EffectComposer, RenderPass, ShaderPass } from 'three-stdlib';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { RipplePass } from '@/postprocessing/RipplePass';

extend({ EffectComposer, RenderPass, ShaderPass })

type EffectProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

export const Effect: FC<EffectProps> = ({ canvasRef }) => {
  const ripple_datas = {
    enabled: true
  }

  const composerRef = useRef<EffectComposer | null>(null)
  const renderRef = useRef<RenderPass>(null)
  const { gl, scene, camera } = useThree()

  useFrame(() => {
    composerRef.current?.render()
  }, 1)

  useEffect(() => {
    if (!renderRef.current || !composerRef.current) return
    const composer = composerRef.current
    const render = renderRef.current
    composer.addPass(render)
    return () => composer.removePass(render)
  }, [])

  return (
    <>
      <effectComposer ref={composerRef} args={[gl]} />
      <renderPass attach="passes" args={[scene, camera]} ref={renderRef} />
      <RipplePass {...ripple_datas} composerRef={composerRef} canvasRef={canvasRef} />
    </>
  )
}
