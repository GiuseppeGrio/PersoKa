import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GameSave } from '../App';
import { DungeonMap, ELEMENT_COLORS } from '../data/gameData';

interface DungeonViewProps {
  save: GameSave;
  onSave: () => void;
  onBattle: () => void;
  onReturn: () => void;
  dungeon: DungeonMap;
}

const CELL_SIZE = 4;
const WALL_HEIGHT = 3;
const MOVE_SPEED = 0.08;
const STEP_COUNTER_MAX = 15;

const THEME_COLORS: Record<string, { wall: number; floor: number; fog: number; light: number }> = {
  school: { wall: 0x2a2a4a, floor: 0x1a1a2e, fog: 0x0a0a1a, light: 0x4488ff },
  port: { wall: 0x1a3a4a, floor: 0x0a2a3a, fog: 0x0a1a2a, light: 0x44ccff },
  mall: { wall: 0x3a2a4a, floor: 0x2a1a3a, fog: 0x1a0a2a, light: 0xff88cc },
  hospital: { wall: 0x2a3a2a, floor: 0x1a2a1a, fog: 0x0a1a0a, light: 0x88ff88 },
  library: { wall: 0x3a3a2a, floor: 0x2a2a1a, fog: 0x1a1a0a, light: 0xffdd44 },
  void: { wall: 0x2a2a3a, floor: 0x1a1a2a, fog: 0x0a0a1a, light: 0xffffff },
};

export function DungeonView({ save, onSave, onBattle, onReturn, dungeon }: DungeonViewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameRef = useRef<number>(0);
  const posRef = useRef({ x: save.playerPos.x, y: save.playerPos.y, dir: save.playerPos.dir });
  const targetRef = useRef({ x: save.playerPos.x, y: save.playerPos.y, dir: save.playerPos.dir });
  const [stepCount, setStepCount] = useState(0);
  const [message, setMessage] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [explored, setExplored] = useState<Set<string>>(new Set(['1,1']));
  const keysRef = useRef<Set<string>>(new Set());
  const isMovingRef = useRef(false);
  const lastTimeRef = useRef(0);

  const grid = dungeon.grid;
  const theme = THEME_COLORS[dungeon.theme] || THEME_COLORS.school;

  // Check if cell is wall
  const isWall = useCallback((x: number, y: number) => {
    if (y < 0 || y >= grid.length || x < 0 || x >= (grid[0]?.length || 0)) return true;
    const c = grid[y][x];
    return c === '#';
  }, [grid]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.fog);
    scene.fog = new THREE.FogExp2(theme.fog, 0.08);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 0);
    cameraRef.current = camera;

    // Build dungeon geometry
    buildDungeon(scene, grid, theme);

    // Ambient light
    const ambient = new THREE.AmbientLight(0x222244, 0.4);
    scene.add(ambient);

    // Point lights along corridors
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < (grid[0]?.length || 0); x++) {
        if (grid[y][x] !== '#' && Math.random() > 0.6) {
          const light = new THREE.PointLight(theme.light, 0.6, 8);
          light.position.set(x * CELL_SIZE, 2.5, y * CELL_SIZE);
          scene.add(light);
        }
      }
    }

    // Player light
    const playerLight = new THREE.PointLight(theme.light, 1.0, 10);
    playerLight.position.set(0, 2, 0);
    scene.add(playerLight);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Smooth movement
      const pos = posRef.current;
      const target = targetRef.current;
      
      if (isMovingRef.current) {
        const dx = target.x - pos.x;
        const dy = target.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0.05) {
          const speed = MOVE_SPEED * delta * 60;
          pos.x += (dx / dist) * Math.min(speed, dist);
          pos.y += (dy / dist) * Math.min(speed, dist);
        } else {
          pos.x = target.x;
          pos.y = target.y;
          isMovingRef.current = false;
        }
      }

      // Smooth rotation
      const targetAngle = -target.dir * (Math.PI / 2);
      let currentAngle = -pos.dir * (Math.PI / 2);
      const angleDiff = targetAngle - currentAngle;
      if (Math.abs(angleDiff) > 0.01) {
        currentAngle += angleDiff * 0.1;
        pos.dir = -currentAngle / (Math.PI / 2);
      }

      // Update camera
      camera.position.set(pos.x * CELL_SIZE, 1.5, pos.y * CELL_SIZE);
      camera.rotation.set(0, -pos.dir * (Math.PI / 2), 0);
      playerLight.position.copy(camera.position);

      renderer.render(scene, camera);
    };
    lastTimeRef.current = performance.now();
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [dungeon.id]);

  // Build dungeon geometry
  function buildDungeon(scene: THREE.Scene, grid: string[], theme: typeof THEME_COLORS[string]) {
    // Floor
    const floorGeo = new THREE.PlaneGeometry(grid[0].length * CELL_SIZE, grid.length * CELL_SIZE);
    const floorMat = new THREE.MeshStandardMaterial({
      color: theme.floor,
      roughness: 0.9,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((grid[0].length * CELL_SIZE) / 2 - CELL_SIZE / 2, 0, (grid.length * CELL_SIZE) / 2 - CELL_SIZE / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(grid[0].length * CELL_SIZE, grid.length * CELL_SIZE);
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x0a0a1a, roughness: 1 });
    const ceil = new THREE.Mesh(ceilGeo, ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set((grid[0].length * CELL_SIZE) / 2 - CELL_SIZE / 2, WALL_HEIGHT, (grid.length * CELL_SIZE) / 2 - CELL_SIZE / 2);
    scene.add(ceil);

    // Walls using InstancedMesh
    let wallCount = 0;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < (grid[0]?.length || 0); x++) {
        if (grid[y][x] === '#') wallCount++;
      }
    }

    const wallGeo = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE);
    const wallMat = new THREE.MeshStandardMaterial({
      color: theme.wall,
      roughness: 0.8,
      metalness: 0.2,
    });
    const wallMesh = new THREE.InstancedMesh(wallGeo, wallMat, wallCount);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;

    const matrix = new THREE.Matrix4();
    let idx = 0;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < (grid[0]?.length || 0); x++) {
        if (grid[y][x] === '#') {
          matrix.setPosition(x * CELL_SIZE, WALL_HEIGHT / 2, y * CELL_SIZE);
          wallMesh.setMatrixAt(idx++, matrix);
        }
      }
    }
    wallMesh.instanceMatrix.needsUpdate = true;
    scene.add(wallMesh);

    // Special markers
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < (grid[0]?.length || 0); x++) {
        const c = grid[y][x];
        if (c === 'P') {
          // Player start - glowing marker
          const markerGeo = new THREE.CircleGeometry(0.5, 16);
          const markerMat = new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.5 });
          const marker = new THREE.Mesh(markerGeo, markerMat);
          marker.rotation.x = -Math.PI / 2;
          marker.position.set(x * CELL_SIZE, 0.01, y * CELL_SIZE);
          scene.add(marker);
        }
        if (c === 'B') {
          // Boss marker
          const bossGeo = new THREE.OctahedronGeometry(0.5);
          const bossMat = new THREE.MeshStandardMaterial({ color: 0xff4444, emissive: 0xff2222, emissiveIntensity: 0.5 });
          const boss = new THREE.Mesh(bossGeo, bossMat);
          boss.position.set(x * CELL_SIZE, 1, y * CELL_SIZE);
          scene.add(boss);
          
          const bossLight = new THREE.PointLight(0xff4444, 1, 6);
          bossLight.position.set(x * CELL_SIZE, 2, y * CELL_SIZE);
          scene.add(bossLight);
        }
        if (c === '.') {
          // Random decorative elements
          if (Math.random() > 0.85) {
            const decoGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
            const decoMat = new THREE.MeshStandardMaterial({ color: theme.light, transparent: true, opacity: 0.3 });
            const deco = new THREE.Mesh(decoGeo, decoMat);
            deco.position.set(x * CELL_SIZE + (Math.random() - 0.5) * 2, 0.15, y * CELL_SIZE + (Math.random() - 0.5) * 2);
            scene.add(deco);
          }
        }
      }
    }
  }

  // Movement logic
  const tryMove = useCallback((dx: number, dy: number) => {
    if (isMovingRef.current) return;
    const pos = posRef.current;
    const dir = Math.round(pos.dir) % 4;
    const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // N, E, S, W
    const [fdx, fdy] = dirs[((dir % 4) + 4) % 4];
    const [sdx, sdy] = dirs[((dir + 1) % 4 + 4) % 4];
    
    let nx = Math.round(targetRef.current.x);
    let ny = Math.round(targetRef.current.y);
    
    if (dx !== 0) {
      nx += fdx * dx;
    }
    if (dy !== 0) {
      nx += sdx * dy;
      ny += sdy * dy;
    }

    // Forward/backward
    if (dx !== 0 && dy === 0) {
      nx = Math.round(targetRef.current.x) + fdx * dx;
      ny = Math.round(targetRef.current.y) + fdy * dx;
    }

    if (!isWall(nx, ny)) {
      targetRef.current = { ...targetRef.current, x: nx, y: ny };
      isMovingRef.current = true;
      setStepCount(s => {
        const ns = s + 1;
        if (ns >= STEP_COUNTER_MAX) {
          onBattle();
          return 0;
        }
        return ns;
      });
      
      // Update explored
      setExplored(prev => {
        const next = new Set(prev);
        next.add(`${nx},${ny}`);
        // Add adjacent
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            if (!isWall(nx + ox, ny + oy)) {
              next.add(`${nx + ox},${ny + oy}`);
            }
          }
        }
        return next;
      });

      // Check for boss
      const cell = grid[ny]?.[nx];
      if (cell === 'B') {
        setMessage(`Ti avvicini a ${dungeon.boss}...`);
        setTimeout(() => {
          setMessage('');
          onBattle();
        }, 1500);
      }
    }
  }, [isWall, onBattle, grid, dungeon.boss]);

  const tryRotate = useCallback((dir: number) => {
    const currentDir = Math.round(targetRef.current.dir) % 4;
    targetRef.current = { ...targetRef.current, dir: ((currentDir + dir) % 4 + 4) % 4 };
  }, []);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': tryMove(1, 0); break;
        case 's': case 'arrowdown': tryMove(-1, 0); break;
        case 'a': case 'arrowleft': tryRotate(-1); break;
        case 'd': case 'arrowright': tryRotate(1); break;
        case 'q': tryMove(0, -1); break;
        case 'e': tryMove(0, 1); break;
        case 'm': setShowMap(v => !v); break;
        case 'escape': onReturn(); break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [tryMove, tryRotate, onReturn]);

  return (
    <div className="w-full h-full relative">
      {/* Three.js canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* HUD */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="bg-[#0a0a2e]/80 border border-[#4488ff]/30 rounded px-3 py-2 text-sm">
          <div className="text-[#4488ff]">{dungeon.name}</div>
          <div className="text-white/50 text-xs">Piano {save.dungeonFloor + 1}/{dungeon.floors}</div>
        </div>
        <div className="bg-[#0a0a2e]/80 border border-[#4488ff]/30 rounded px-3 py-2 text-sm">
          <div className="text-white/60">Passi: <span className="text-[#ffdd44]">{stepCount}/{STEP_COUNTER_MAX}</span></div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a2e]/90 border border-[#ff4444]/50 rounded-lg px-6 py-4 text-[#ff8888] text-lg">
          {message}
        </div>
      )}

      {/* Minimap */}
      {showMap && (
        <div className="absolute top-4 right-4 bg-[#0a0a2e]/90 border border-[#4488ff]/30 rounded p-3">
          <div className="text-[#4488ff] text-xs mb-2 text-center">Mappa</div>
          <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 10}, 12px)` }}>
            {grid.map((row, y) =>
              row.split('').map((cell, x) => {
                const isExplored = explored.has(`${x},${y}`);
                const isPlayer = x === Math.round(posRef.current.x) && y === Math.round(posRef.current.y);
                return (
                  <div
                    key={`${x},${y}`}
                    className={`w-3 h-3 rounded-sm ${
                      isPlayer ? 'bg-[#4488ff]' :
                      cell === '#' ? (isExplored ? 'bg-[#2a2a4a]' : 'bg-transparent') :
                      cell === 'B' ? (isExplored ? 'bg-[#ff4444]' : 'bg-transparent') :
                      cell === 'P' ? (isExplored ? 'bg-[#4488ff]/50' : 'bg-transparent') :
                      isExplored ? 'bg-[#1a1a3a]' : 'bg-transparent'
                    }`}
                  />
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button onClick={() => tryRotate(-1)} className="w-10 h-10 bg-[#0a0a2e]/80 border border-[#4488ff]/30 rounded flex items-center justify-center text-[#4488ff] hover:bg-[#4488ff]/20">←</button>
        <button onClick={() => tryMove(1, 0)} className="w-10 h-10 bg-[#0a0a2e]/80 border border-[#4488ff]/30 rounded flex items-center justify-center text-[#4488ff] hover:bg-[#4488ff]/20">↑</button>
        <button onClick={() => tryMove(-1, 0)} className="w-10 h-10 bg-[#0a0a2e]/80 border border-[#4488ff]/30 rounded flex items-center justify-center text-[#4488ff] hover:bg-[#4488ff]/20">↓</button>
        <button onClick={() => tryRotate(1)} className="w-10 h-10 bg-[#0a0a2e]/80 border border-[#4488ff]/30 rounded flex items-center justify-center text-[#4488ff] hover:bg-[#4488ff]/20">→</button>
        <div className="w-4" />
        <button onClick={() => setShowMap(v => !v)} className="w-10 h-10 bg-[#0a0a2e]/80 border border-[#4488ff]/30 rounded flex items-center justify-center text-[#4488ff] hover:bg-[#4488ff]/20 text-xs">M</button>
        <button onClick={onSave} className="w-10 h-10 bg-[#0a0a2e]/80 border border-[#4488ff]/30 rounded flex items-center justify-center text-[#4488ff] hover:bg-[#4488ff]/20 text-xs">💾</button>
        <button onClick={onReturn} className="w-10 h-10 bg-[#0a0a2e]/80 border border-[#ff4444]/30 rounded flex items-center justify-center text-[#ff8888] hover:bg-[#ff4444]/20 text-xs">✕</button>
      </div>

      {/* Controls help */}
      <div className="absolute bottom-4 right-4 text-white/20 text-xs">
        WASD/Frecce: muovi · M: mappa · Esc: torna
      </div>
    </div>
  );
}
