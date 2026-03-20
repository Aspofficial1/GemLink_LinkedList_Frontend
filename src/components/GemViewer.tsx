import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const GemModel: React.FC = () => {
  const { scene } = useGLTF("/image/sky_blue_crystal.glb");
  const groupRef = useRef<THREE.Group>(null);

  // Slow auto-rotation — stops when user grabs it (OrbitControls takes over)
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.75} position={[0, 0.3, 0]} />
    </group>
  );
};

const Loader: React.FC = () => (
  <mesh>
    <octahedronGeometry args={[1.2, 0]} />
    <meshStandardMaterial color="#1B4F8A" wireframe />
  </mesh>
);

const GemViewer: React.FC = () => (
  <div className="relative flex items-center justify-center">
    {/* Outer decorative ring */}
    <div className="absolute w-[560px] h-[560px] rounded-full border border-border pointer-events-none" />

    {/* Circle container — Canvas is clipped inside this */}
    <div
      className="relative z-10 w-[520px] h-[520px] rounded-full overflow-hidden"
      style={{ background: "radial-gradient(circle at 40% 35%, #e8f0fa 0%, #d0dff5 60%, #b8cef0 100%)" }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 7.5], fov: 38 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow />
        <pointLight position={[-4, 4, -4]} intensity={0.9} color="#4A7FC1" />
        <pointLight position={[4, -2, 4]} intensity={0.5} color="#C9A84C" />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* The gem model — shows a wireframe octahedron while loading */}
        <Suspense fallback={<Loader />}>
          <GemModel />
        </Suspense>

        {/* Soft shadow under the gem */}
        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.3}
          scale={5}
          blur={2}
          far={3}
        />

        {/* Orbit controls — user can drag, scroll to zoom */}
        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={12}
          autoRotate={false}
        />
      </Canvas>
    </div>

    {/* Hint label */}
    <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[11px] text-text-muted select-none pointer-events-none whitespace-nowrap">
      Drag to rotate · Scroll to zoom
    </p>
  </div>
);

// Pre-load the model so it's ready before the component mounts
useGLTF.preload("/image/sky_blue_crystal.glb");

export default GemViewer;
