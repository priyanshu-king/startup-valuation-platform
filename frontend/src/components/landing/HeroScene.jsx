import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'

function ValueStructure() {
  const structure = useRef()
  const pillars = useMemo(
    () => [
      [-1.25, 0.1, 0, 0.58, 1.15, 0.58],
      [-0.42, 0.55, 0, 0.58, 2.05, 0.58],
      [0.42, 0.95, 0, 0.58, 2.85, 0.58],
      [1.25, 1.35, 0, 0.58, 3.65, 0.58],
    ],
    [],
  )

  useFrame(({ clock, pointer }, delta) => {
    if (!structure.current) return
    structure.current.rotation.y += delta * 0.035
    structure.current.rotation.y += (pointer.x * 0.12 - structure.current.rotation.y) * delta * 0.12
    structure.current.rotation.x += (-pointer.y * 0.035 - structure.current.rotation.x) * delta * 0.12
    structure.current.position.y = Math.sin(clock.elapsedTime * 0.28) * 0.045
  })

  return (
    <group ref={structure} rotation={[0.03, -0.3, -0.06]}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[3.6, 0.12, 1.5]} />
        <meshStandardMaterial color="#e5dfd1" roughness={0.75} />
      </mesh>
      {pillars.map(([x, y, z, width, height, depth], index) => (
        <mesh key={index} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            color={index === 3 ? '#56785f' : '#c7c3b6'}
            roughness={0.45}
            metalness={0.08}
          />
        </mesh>
      ))}
      <mesh position={[0.15, 0.65, -0.48]} rotation={[Math.PI / 2.15, 0.1, -0.55]}>
        <torusGeometry args={[1.58, 0.016, 8, 96]} />
        <meshBasicMaterial color="#6e9375" transparent opacity={0.72} />
      </mesh>
      <mesh position={[-0.82, 0.85, 0.35]} rotation={[0.3, 0.4, 0.2]}>
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#a28d67" roughness={0.35} />
      </mesh>
    </group>
  )
}

export default function HeroScene({ fallback }) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [4.1, 3.2, 6.8], fov: 34 }}
      dpr={[1, 1.35]}
      fallback={fallback}
      gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#f2efe7', 0)
      }}
    >
      <ambientLight intensity={1.7} />
      <directionalLight position={[4, 7, 5]} intensity={2.2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.55} color="#758b73" />
      <ValueStructure />
    </Canvas>
  )
}
