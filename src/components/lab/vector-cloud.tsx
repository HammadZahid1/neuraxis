"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { CATEGORY_COLORS, CONCEPTS, type Concept } from "@/lib/data/concepts";

function ConceptSphere({ concept, color, selected, onHover, onSelect }: {
  concept: Concept;
  color: string;
  selected: boolean;
  onHover: (c: Concept | null) => void;
  onSelect: (c: Concept) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const target = selected ? 1.8 : 1;
    mesh.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
    if (!selected) {
      mesh.current.position.y = concept.p[1] + Math.sin(clock.elapsedTime * 0.7 + concept.p[0]) * 0.08;
    }
  });
  const enter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(concept);
  };
  return (
    <mesh
      ref={mesh}
      position={concept.p}
      onPointerOver={enter}
      onPointerOut={() => onHover(null)}
      onClick={(e) => { e.stopPropagation(); onSelect(concept); }}
    >
      <sphereGeometry args={[selected ? 0.24 : 0.16, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={selected ? 1.4 : 0.5}
        transparent
        opacity={selected ? 1 : 0.85}
      />
    </mesh>
  );
}

function Scene({ visible, selected, hoverWord, onHover, onSelect }: {
  visible: Set<string>;
  selected: Concept | null;
  hoverWord: string | null;
  onHover: (c: Concept | null) => void;
  onSelect: (c: Concept) => void;
}) {
  const points = useMemo(() => CONCEPTS.filter((c) => visible.has(c.category)), [visible]);
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[8, 8, 8]} intensity={60} color="#00d9ff" />
      <pointLight position={[-8, -4, -6]} intensity={40} color="#7667ff" />
      <gridHelper args={[24, 24, "#1b2633", "#111823"]} position={[0, -7, 0]} />
      {points.map((c) => (
        <ConceptSphere
          key={c.word}
          concept={c}
          color={CATEGORY_COLORS[c.category]}
          selected={selected?.word === c.word || hoverWord === c.word}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
      <OrbitControls enableDamping dampingFactor={0.12} minDistance={4} maxDistance={26} autoRotate autoRotateSpeed={0.35} />
    </>
  );
}

export default function VectorCloud({ visible, selected, onSelect }: {
  visible: Set<string>;
  selected: Concept | null;
  onSelect: (c: Concept) => void;
}) {
  const [hover, setHover] = useState<Concept | null>(null);
  const allCategories = useMemo(() => new Set(CONCEPTS.map((c) => c.category)), []);

  return (
    <div className="relative h-[460px] overflow-hidden rounded-xl border border-line bg-bg-2">
      <Canvas camera={{ position: [9, 5, 11], fov: 50 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}>
        <Scene
          visible={visible.size ? visible : allCategories}
          selected={selected}
          hoverWord={hover?.word ?? null}
          onHover={setHover}
          onSelect={onSelect}
        />
      </Canvas>
      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
        {(Object.keys(CATEGORY_COLORS) as Array<keyof typeof CATEGORY_COLORS>).map((cat) => (
          <span key={cat} className="flex items-center gap-1.5 rounded-md border border-line bg-panel/85 px-2 py-0.5 text-[10px] text-mute">
            <i className="inline-block h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[cat] }} />
            {cat}
          </span>
        ))}
      </div>
      {hover && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-line bg-panel/90 px-3 py-2">
          <div className="text-xs font-medium text-ink">{hover.word}</div>
          <div className="text-[10px] text-mute">{hover.category} · 16-d embedding · click to select</div>
        </div>
      )}
      <div className="pointer-events-none absolute bottom-3 right-3 font-mono text-[10px] text-mute/70">drag to orbit · scroll to zoom</div>
    </div>
  );
}
