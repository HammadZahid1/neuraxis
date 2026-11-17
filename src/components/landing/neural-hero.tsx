"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Group, Points as ThreePoints } from "three";
import { useLocalStorage, usePrefersReducedMotion } from "@/hooks";

/* Deterministic PRNG so the structure is identical on every load */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LAYERS = [4, 6, 8, 6, 3];
const SPREAD = 2.6;

interface Node { p: [number, number, number]; layer: number }

function buildNetwork(seed: number) {
  const rand = mulberry32(seed);
  const nodes: Node[] = [];
  LAYERS.forEach((count, li) => {
    const x = (li - (LAYERS.length - 1) / 2) * SPREAD;
    for (let i = 0; i < count; i++) {
      const y = (i - (count - 1) / 2) * 1.15 + (rand() - 0.5) * 0.3;
      const z = (rand() - 0.5) * 1.6;
      nodes.push({ p: [x, y, z], layer: li });
    }
  });
  const links: Array<[number, number]> = [];
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const a = nodes.filter((n) => n.layer === li);
    const b = nodes.filter((n) => n.layer === li + 1);
    a.forEach((na, ai) => {
      b.forEach((nb, bi) => {
        if (rand() < 0.55 || (ai % 2 === bi % 2)) links.push([nodes.indexOf(na), nodes.indexOf(nb)]);
      });
    });
  }
  return { nodes, links };
}

function Structure({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  const { nodes, links } = useMemo(() => buildNetwork(2026), []);

  const lineGeo = useMemo(() => {
    const pos = new Float32Array(links.length * 6);
    links.forEach(([a, b], i) => {
      pos.set(nodes[a].p, i * 6);
      pos.set(nodes[b].p, i * 6 + 3);
    });
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(pos, 3));
    return geo;
  }, [nodes, links]);

  /* Signal pulses travelling along random links */
  const pulses = useMemo(() => {
    const rand = mulberry32(99);
    return Array.from({ length: 24 }, () => ({
      link: links[Math.floor(rand() * links.length)],
      speed: 0.25 + rand() * 0.5,
      offset: rand(),
    }));
  }, [links]);

  const nodeGeo = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(new Float32Array(nodes.flatMap((n) => n.p)), 3));
    return geo;
  }, [nodes]);

  useFrame(({ clock }) => {
    if (group.current && !reduced) {
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.18) * 0.45;
      group.current.rotation.z = Math.sin(clock.elapsedTime * 0.12) * 0.06;
    }
    const t = clock.elapsedTime;
    // update pulse positions
    const pulseMesh = group.current?.getObjectByName("pulses") as ThreePoints | undefined;
    if (pulseMesh) {
      const attr = pulseMesh.geometry.getAttribute("position") as BufferAttribute;
      pulses.forEach((p, i) => {
        const [a, b] = p.link;
        const k = reduced ? 0.5 : ((t * p.speed + p.offset) % 1);
        const pa = nodes[a].p, pb = nodes[b].p;
        attr.setXYZ(i, pa[0] + (pb[0] - pa[0]) * k, pa[1] + (pb[1] - pa[1]) * k, pa[2] + (pb[2] - pa[2]) * k);
      });
      attr.needsUpdate = true;
    }
    // gentle node breathing
    const nodePts = group.current?.getObjectByName("nodes") as ThreePoints | undefined;
    if (nodePts && !reduced) {
      nodePts.position.y = Math.sin(t * 0.6) * 0.06;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#1e3a4f" transparent opacity={0.5} />
      </lineSegments>
      <points name="nodes" geometry={nodeGeo}>
        <pointsMaterial size={0.34} color="#00d9ff" transparent opacity={0.95} sizeAttenuation blending={AdditiveBlending} />
      </points>
      <points name="pulses">
        <pointsMaterial size={0.16} color="#a78bfa" transparent opacity={0.9} sizeAttenuation blending={AdditiveBlending} />
      </points>
    </group>
  );
}

export default function NeuralHero() {
  const reduced = usePrefersReducedMotion();
  const [animEnabled] = useLocalStorage("nx-anim-enabled", true);
  const still = reduced || !animEnabled;
  return (
    <Canvas
      camera={{ position: [0, 0.6, 9.5], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 3, 5]} intensity={30} color="#00d9ff" distance={18} />
      <pointLight position={[-5, -2, 3]} intensity={22} color="#7667ff" distance={18} />
      <Structure reduced={still} />
    </Canvas>
  );
}
