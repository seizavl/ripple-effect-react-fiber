import React, { Suspense, useEffect, useMemo, useRef, FC, RefObject } from 'react';
import { EffectComposer, RenderPass, ShaderPass } from 'three-stdlib';
import { useTexture } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import { RippleRenderer } from './ripple';

extend({ ShaderPass })


export const RipplePass: FC<RipplePassType> = props => {
	const { enabled = true, composerRef, canvasRef } = props;

	return (
		<Suspense fallback={null}>
			<Ripple enabled={enabled} composerRef={composerRef} canvasRef={canvasRef} />

		</Suspense>
	)
}

// ========================================================
type RipplePassType = {
	enabled?: boolean
	composerRef: RefObject<EffectComposer | null>
	canvasRef: RefObject<HTMLCanvasElement | null>
  }


type RippleType = {
	enabled?: boolean
	composerRef: RefObject<EffectComposer | null>
	canvasRef: RefObject<HTMLCanvasElement | null> 
}

const Ripple: FC<RippleType> = props => {
	const { enabled = true, composerRef, canvasRef } = props;

	const shaderRef = useRef<ShaderPass>(null)

	const rippleTexture = useTexture("/brush.png")
	const effect = useMemo(() => new RippleRenderer(rippleTexture), [rippleTexture])
	const shader = useMemo(() => {
		return {
			uniforms: {
				tDiffuse: { value: null },
				u_displacement: { value: null }
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		}
	}, [])
	useEffect(() => {
		return () => effect.dispose()
	},[effect])
	useFrame(({ gl }) => {
		effect.update(gl, shaderRef.current!.uniforms.u_displacement)
	})

	useEffect(() => {
		if (canvasRef.current) {
			effect.enable(canvasRef.current) // ←ここで渡す！
		}
		return () => {
			effect.dispose()
		}
	}, [effect, canvasRef])

	useEffect(() => {
		if (!shaderRef.current) return
		if (!composerRef.current) return
		const composer = composerRef.current
		const render = shaderRef.current
	
		composer.addPass(render)
		return () => composer.removePass(render);
	}, []);

	

	return <shaderPass ref={shaderRef} attach="passes" args={[shader]} enabled={enabled} />
}

// --------------------------------------------------------
const vertexShader = `
varying vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform sampler2D u_displacement;
varying vec2 v_uv;

float PI = 3.141592653589;

void main() {
  vec2 uv = v_uv;

  vec4 disp = texture2D(u_displacement, uv);
  float theta = disp.r * 0.7 * PI;
  vec2 dir = vec2(sin(theta), cos(theta));
  uv += dir * disp.r * 0.1;

  vec4 color = texture2D(tDiffuse, uv);

  gl_FragColor = color;
  // gl_FragColor = texture2D(u_displacement, v_uv);
}
`