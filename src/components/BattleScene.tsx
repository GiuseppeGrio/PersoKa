import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Kana, KANA_DATABASE, ELEMENT_COLORS, Element } from '../data/gameData';

interface BattleSceneProps {
  party: Kana[];
  onEnd: (won: boolean) => void;
  isTutorial: boolean;
}

interface BattleUnit {
  kana: Kana;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  isEnemy: boolean;
  statusEffects: string[];
}

interface DamageNumber {
  id: number;
  value: number;
  x: number;
  y: number;
  isHeal: boolean;
  time: number;
}

type BattlePhase = 'START' | 'PLAYER_TURN' | 'ENEMY_TURN' | 'ANIMATING' | 'WIN' | 'LOSE' | 'NEGOTIATE';

const ELEMENT_WEAKNESS: Record<Element, Element> = {
  luce: 'ombra', fuoco: 'ghiaccio', ghiaccio: 'fuoco', vento: 'fulmine',
  fulmine: 'terra', terra: 'vento', ombra: 'luce', fisico: 'fisico',
};

function generateEnemies(party: Kana[], isTutorial: boolean): BattleUnit[] {
  const count = isTutorial ? 1 : Math.min(1 + Math.floor(Math.random() * 3), 4);
  const enemies: BattleUnit[] = [];
  
  const enemyPool = isTutorial
    ? [KANA_DATABASE[10], KANA_DATABASE[15]]
    : KANA_DATABASE.filter((_, i) => i % 3 === 0).slice(0, 10);

  for (let i = 0; i < count; i++) {
    const base = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    const level = Math.max(1, Math.floor(party.reduce((s, k) => s + (k.hp || 20), 0) / party.length / 5));
    const hp = (base.hp || 20) + level * 3;
    enemies.push({
      kana: { ...base, id: `enemy_${i}_${Date.now()}` },
      currentHp: hp,
      maxHp: hp,
      currentMp: (base.mp || 10) + level * 2,
      maxMp: (base.mp || 10) + level * 2,
      isEnemy: true,
      statusEffects: [],
    });
  }
  return enemies;
}

export function BattleScene({ party, onEnd, isTutorial }: BattleSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const frameRef = useRef<number>(0);
  
  const [partyUnits, setPartyUnits] = useState<BattleUnit[]>(() =>
    party.map(k => ({
      kana: k,
      currentHp: k.hp || 30,
      maxHp: k.hp || 30,
      currentMp: k.mp || 15,
      maxMp: k.mp || 15,
      isEnemy: false,
      statusEffects: [],
    }))
  );
  const [enemies, setEnemies] = useState<BattleUnit[]>(() => generateEnemies(party, isTutorial));
  const [phase, setPhase] = useState<BattlePhase>('START');
  const [currentUnit, setCurrentUnit] = useState(0);
  const [selectedAction, setSelectedAction] = useState<'attack' | 'skill' | 'defend' | 'talk' | 'flee'>('attack');
  const [selectedTarget, setSelectedTarget] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState(0);
  const [log, setLog] = useState<string[]>(['La battaglia inizia!']);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [negotiateState, setNegotiateState] = useState<{ tone: number; rounds: number; maxRounds: number } | null>(null);
  const dmgIdRef = useRef(0);
  const lastTimeRef = useRef(0);

  const addLog = useCallback((msg: string) => {
    setLog(prev => [...prev.slice(-4), msg]);
  }, []);

  // Initialize Three.js battle background
  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a2e);
    scene.fog = new THREE.FogExp2(0x0a0a2e, 0.05);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 1, 0);

    // Battle platform
    const platformGeo = new THREE.CylinderGeometry(6, 7, 0.3, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a3a,
      roughness: 0.8,
      metalness: 0.3,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.15;
    scene.add(platform);

    // Grid lines on platform
    const gridHelper = new THREE.GridHelper(12, 12, 0x4488ff, 0x222244);
    gridHelper.position.y = 0.01;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.3;
    scene.add(gridHelper);

    // Ambient
    scene.add(new THREE.AmbientLight(0x4444aa, 0.5));
    
    // Key light
    const keyLight = new THREE.DirectionalLight(0x4488ff, 0.8);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    // Enemy side light
    const enemyLight = new THREE.PointLight(0xff4444, 0.6, 15);
    enemyLight.position.set(0, 3, -4);
    scene.add(enemyLight);

    // Floating particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x4488ff, size: 0.05, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const time = now * 0.001;
      
      particles.rotation.y = time * 0.1;
      const pos = particleGeo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        (pos.array as Float32Array)[i * 3 + 1] += Math.sin(time + i) * 0.002;
      }
      pos.needsUpdate = true;

      renderer.render(scene, camera);
    };
    lastTimeRef.current = performance.now();
    animate();

    // Start battle after delay
    setTimeout(() => setPhase('PLAYER_TURN'), 1000);

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
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Calculate damage
  const calcDamage = (attacker: BattleUnit, defender: BattleUnit, skill?: typeof attacker.kana.abilities[0]): number => {
    const baseAtk = attacker.kana.atk || 10;
    const baseDef = defender.kana.def || 5;
    const power = skill ? skill.power : baseAtk;
    const element = skill ? skill.element : attacker.kana.element;
    
    let multiplier = 1;
    if (ELEMENT_WEAKNESS[element] === defender.kana.element) multiplier = 1.5;
    if (element === defender.kana.element) multiplier = 0.5;
    
    const crit = Math.random() < 0.1 ? 1.5 : 1;
    const variance = 0.9 + Math.random() * 0.2;
    
    return Math.max(1, Math.floor((power * multiplier * crit * variance) - baseDef * 0.3));
  };

  // Execute player action
  const executePlayerAction = useCallback(() => {
    const unit = partyUnits[currentUnit];
    if (!unit || unit.currentHp <= 0) {
      advanceToNextUnit();
      return;
    }

    if (selectedAction === 'attack') {
      const target = enemies[selectedTarget];
      if (!target || target.currentHp <= 0) {
        advanceToNextUnit();
        return;
      }
      const dmg = calcDamage(unit, target);
      const newEnemies = enemies.map((e, i) => i === selectedTarget ? { ...e, currentHp: Math.max(0, e.currentHp - dmg) } : e);
      setEnemies(newEnemies);
      addLog(`${unit.kana.glyph} attacca ${target.kana.glyph} per ${dmg} danni!`);
      showDamage(dmg, false);
      
      if (newEnemies.every(e => e.currentHp <= 0)) {
        setPhase('WIN');
        return;
      }
    } else if (selectedAction === 'skill') {
      const skill = unit.kana.abilities[selectedSkill];
      if (!skill || unit.currentMp < 5) {
        addLog('MP insufficienti!');
        return;
      }
      
      if (skill.type === 'heal') {
        const healAmt = skill.power + (unit.kana.mag || 10);
        const newParty = partyUnits.map((u, i) => i === currentUnit ? { ...u, currentHp: Math.min(u.maxHp, u.currentHp + healAmt), currentMp: u.currentMp - 5 } : u);
        setPartyUnits(newParty);
        addLog(`${unit.kana.glyph} usa ${skill.name} (${skill.italian})! Recupera ${healAmt} HP!`);
        showDamage(healAmt, true);
      } else {
        const target = enemies[selectedTarget];
        if (!target || target.currentHp <= 0) return;
        const dmg = calcDamage(unit, target, skill);
        const newEnemies = enemies.map((e, i) => i === selectedTarget ? { ...e, currentHp: Math.max(0, e.currentHp - dmg) } : e);
        const newParty = partyUnits.map((u, i) => i === currentUnit ? { ...u, currentMp: u.currentMp - 5 } : u);
        setEnemies(newEnemies);
        setPartyUnits(newParty);
        addLog(`${unit.kana.glyph} usa ${skill.name} (${skill.italian})! ${dmg} danni!`);
        showDamage(dmg, false);
        
        if (newEnemies.every(e => e.currentHp <= 0)) {
          setPhase('WIN');
          return;
        }
      }
    } else if (selectedAction === 'defend') {
      addLog(`${unit.kana.glyph} si mette in difesa!`);
    } else if (selectedAction === 'talk') {
      setPhase('NEGOTIATE');
      setNegotiateState({ tone: 0, rounds: 0, maxRounds: 3 });
      addLog(`${unit.kana.glyph} prova a parlare con il nemico...`);
      return;
    } else if (selectedAction === 'flee') {
      if (Math.random() < 0.5) {
        addLog('Fuga riuscita!');
        setTimeout(() => onEnd(false), 1000);
        return;
      } else {
        addLog('Fuga fallita!');
      }
    }

    setPhase('ANIMATING');
    setTimeout(() => advanceToNextUnit(), 800);
  }, [partyUnits, enemies, currentUnit, selectedAction, selectedTarget, selectedSkill, addLog, onEnd]);

  const advanceToNextUnit = useCallback(() => {
    // Find next alive party member
    let next = currentUnit + 1;
    while (next < partyUnits.length && partyUnits[next].currentHp <= 0) next++;
    
    if (next >= partyUnits.length) {
      // All party members acted, enemy turn
      setPhase('ENEMY_TURN');
      setTimeout(() => executeEnemyTurn(), 500);
    } else {
      setCurrentUnit(next);
      setPhase('PLAYER_TURN');
    }
  }, [currentUnit, partyUnits]);

  const executeEnemyTurn = useCallback(() => {
    const aliveEnemies = enemies.filter(e => e.currentHp > 0);
    let delay = 0;
    
    aliveEnemies.forEach((enemy) => {
      setTimeout(() => {
        const aliveParty = partyUnits.filter(u => u.currentHp > 0);
        if (aliveParty.length === 0) return;
        
        const targetIdx = Math.floor(Math.random() * aliveParty.length);
        const target = aliveParty[targetIdx];
        const realIdx = partyUnits.indexOf(target);
        
        const skill = enemy.kana.abilities[Math.floor(Math.random() * enemy.kana.abilities.length)];
        const dmg = calcDamage(enemy, target, skill);
        
        setPartyUnits(prev => prev.map((u, i) => i === realIdx ? { ...u, currentHp: Math.max(0, u.currentHp - dmg) } : u));
        addLog(`${enemy.kana.glyph} usa ${skill.name} su ${target.kana.glyph}! ${dmg} danni!`);
        showDamage(dmg, false);
      }, delay);
      delay += 600;
    });

    setTimeout(() => {
      setPartyUnits(prev => {
        if (prev.every(u => u.currentHp <= 0)) {
          setPhase('LOSE');
          return prev;
        }
        // Reset to first alive party member
        const firstAlive = prev.findIndex(u => u.currentHp > 0);
        setCurrentUnit(firstAlive >= 0 ? firstAlive : 0);
        setPhase('PLAYER_TURN');
        return prev;
      });
    }, delay + 400);
  }, [enemies, partyUnits, addLog]);

  const showDamage = (value: number, isHeal: boolean) => {
    const id = dmgIdRef.current++;
    setDamageNumbers(prev => [...prev, {
      id, value, x: 50 + (Math.random() - 0.5) * 20, y: 40, isHeal, time: Date.now(),
    }]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, 1500);
  };

  // Negotiation
  const handleNegotiate = (toneIdx: number) => {
    if (!negotiateState) return;
    const tones = ['Gentile', 'Fermo', 'Curioso', 'Scherzoso'];
    const target = enemies.find(e => e.currentHp > 0);
    if (!target) return;

    const success = Math.random() < (0.3 + toneIdx * 0.1 + negotiateState.rounds * 0.15);
    
    if (negotiateState.rounds >= negotiateState.maxRounds - 1) {
      if (success) {
        addLog(`${target.kana.glyph} si unisce al tuo gruppo!`);
        setTimeout(() => onEnd(true), 1500);
      } else {
        addLog(`${target.kana.glyph} rifiuta e scappa!`);
        setEnemies(prev => prev.map((e, i) => e === target ? { ...e, currentHp: 0 } : e));
        if (enemies.every(e => e.currentHp <= 0 || e === target)) {
          setPhase('WIN');
        } else {
          setPhase('PLAYER_TURN');
        }
      }
      setNegotiateState(null);
    } else {
      addLog(`Tono "${tones[toneIdx]}"... ${target.kana.glyph} ${success ? 'sembra interessato' : 'è diffidente'}...`);
      setNegotiateState(prev => prev ? { ...prev, rounds: prev.rounds + 1 } : null);
    }
  };

  // Check win/lose
  useEffect(() => {
    if (enemies.every(e => e.currentHp <= 0) && phase !== 'WIN' && phase !== 'START') {
      setPhase('WIN');
    }
    if (partyUnits.every(u => u.currentHp <= 0) && phase !== 'LOSE') {
      setPhase('LOSE');
    }
  }, [enemies, partyUnits, phase]);

  return (
    <div className="w-full h-full relative">
      {/* Three.js background */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Battle UI overlay */}
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* Enemy area */}
        <div className="flex justify-center gap-4 pt-8 pointer-events-auto">
          {enemies.map((enemy, i) => (
            <div
              key={i}
              onClick={() => { if (phase === 'PLAYER_TURN') setSelectedTarget(i); }}
              className={`text-center cursor-pointer transition-all ${
                enemy.currentHp <= 0 ? 'opacity-20' :
                i === selectedTarget ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center text-2xl md:text-3xl ${
                i === selectedTarget ? 'border-[#ff4444] bg-[#ff4444]/20 shadow-lg shadow-[#ff4444]/30' :
                'border-[#4488ff]/30 bg-[#0a0a2e]/50'
              }`} style={{ color: ELEMENT_COLORS[enemy.kana.element] }}>
                {enemy.kana.glyph}
              </div>
              <div className="mt-1 text-xs">
                <div className="w-16 md:w-20 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 transition-all" style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }} />
                </div>
                <div className="text-white/50 text-[10px]">{enemy.currentHp}/{enemy.maxHp}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Damage numbers */}
        {damageNumbers.map(d => (
          <div
            key={d.id}
            className={`absolute text-2xl font-bold animate-bounce pointer-events-none ${d.isHeal ? 'text-green-400' : 'text-red-400'}`}
            style={{ left: `${d.x}%`, top: `${d.y}%`, animation: 'floatUp 1.5s ease-out forwards' }}
          >
            {d.isHeal ? '+' : '-'}{d.value}
          </div>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Party area */}
        <div className="pointer-events-auto">
          <div className="flex justify-center gap-3 mb-2">
            {partyUnits.map((unit, i) => (
              <div key={i} className={`text-center ${unit.currentHp <= 0 ? 'opacity-30' : ''} ${i === currentUnit && phase === 'PLAYER_TURN' ? 'ring-2 ring-[#4488ff] rounded-lg' : ''}`}>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#4488ff]/30 flex items-center justify-center text-xl bg-[#0a0a2e]/80" style={{ color: ELEMENT_COLORS[unit.kana.element] }}>
                  {unit.kana.glyph}
                </div>
                <div className="w-14 md:w-16 mt-1 space-y-0.5">
                  <div className="h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all" style={{ width: `${(unit.currentHp / unit.maxHp) * 100}%` }} />
                  </div>
                  <div className="h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${(unit.currentMp / unit.maxMp) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action menu */}
          {phase === 'PLAYER_TURN' && (
            <div className="bg-[#0a0a2e]/90 border border-[#4488ff]/30 rounded-lg p-3 mx-4 mb-4">
              <div className="text-[#4488ff] text-xs mb-2">Turno di {partyUnits[currentUnit]?.kana.glyph} — Scegli azione:</div>
              <div className="flex flex-wrap gap-2">
                {(['attack', 'skill', 'defend', 'talk', 'flee'] as const).map(action => (
                  <button
                    key={action}
                    onClick={() => {
                      setSelectedAction(action);
                      if (action === 'attack' || action === 'skill') return;
                      executePlayerAction();
                    }}
                    className={`px-3 py-1.5 rounded text-sm transition ${
                      selectedAction === action ? 'bg-[#4488ff]/40 text-white' : 'bg-[#4488ff]/10 text-[#88aaff] hover:bg-[#4488ff]/20'
                    }`}
                  >
                    {action === 'attack' ? '⚔️ Attacca' : action === 'skill' ? '✨ Abilità' : action === 'defend' ? '🛡️ Difendi' : action === 'talk' ? '💬 Parla' : '🏃 Fuggi'}
                  </button>
                ))}
              </div>

              {/* Skill selection */}
              {selectedAction === 'skill' && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {partyUnits[currentUnit]?.kana.abilities.map((skill, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedSkill(i); }}
                      className={`px-2 py-1 rounded text-xs transition ${
                        selectedSkill === i ? 'bg-[#ffdd44]/30 text-[#ffdd44]' : 'bg-[#4488ff]/10 text-white/60 hover:bg-[#4488ff]/20'
                      }`}
                    >
                      {skill.name} ({skill.italian}) [{skill.power}]
                    </button>
                  ))}
                  <button onClick={executePlayerAction} className="px-3 py-1 rounded text-xs bg-green-900/30 text-green-400 hover:bg-green-900/50 ml-2">
                    Usa →
                  </button>
                </div>
              )}

              {/* Target selection for attack/skill */}
              {(selectedAction === 'attack' || selectedAction === 'skill') && (
                <div className="mt-2">
                  <div className="text-xs text-white/40 mb-1">Bersaglio:</div>
                  <div className="flex gap-1">
                    {enemies.filter(e => e.currentHp > 0).map((e, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedTarget(enemies.indexOf(e))}
                        className={`px-2 py-1 rounded text-sm ${
                          selectedTarget === enemies.indexOf(e) ? 'bg-[#ff4444]/30 text-[#ff8888]' : 'bg-[#4488ff]/10 text-white/60'
                        }`}
                      >
                        {e.kana.glyph}
                      </button>
                    ))}
                    <button onClick={executePlayerAction} className="px-3 py-1 rounded text-xs bg-green-900/30 text-green-400 hover:bg-green-900/50 ml-2">
                      Esegui →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Negotiation UI */}
          {phase === 'NEGOTIATE' && negotiateState && (
            <div className="bg-[#0a0a2e]/90 border border-[#ffdd44]/30 rounded-lg p-3 mx-4 mb-4">
              <div className="text-[#ffdd44] text-xs mb-2">Negoziazione — Round {negotiateState.rounds + 1}/{negotiateState.maxRounds}</div>
              <div className="flex gap-2">
                {['Gentile', 'Fermo', 'Curioso', 'Scherzoso'].map((tone, i) => (
                  <button
                    key={i}
                    onClick={() => handleNegotiate(i)}
                    className="px-3 py-1.5 rounded text-sm bg-[#ffdd44]/10 text-[#ffdd44] hover:bg-[#ffdd44]/30 transition"
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Battle log */}
          <div className="bg-[#0a0a2e]/80 border-t border-[#4488ff]/20 px-4 py-2">
            {log.slice(-2).map((msg, i) => (
              <div key={i} className="text-sm text-white/70">{msg}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Win/Lose overlay */}
      {(phase === 'WIN' || phase === 'LOSE') && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a2e]/80 z-50">
          <div className="text-center">
            <div className={`text-4xl mb-4 ${phase === 'WIN' ? 'text-[#4488ff]' : 'text-[#ff4444]'}`}>
              {phase === 'WIN' ? 'Vittoria!' : 'Sconfitta...'}
            </div>
            {phase === 'WIN' && (
              <div className="text-white/60 mb-4">
                +{enemies.length * 10} EXP · +{enemies.length * 5} Gold
              </div>
            )}
            <button
              onClick={() => onEnd(phase === 'WIN')}
              className="px-6 py-2 bg-[#4488ff]/20 border border-[#4488ff]/40 rounded text-[#4488ff] hover:bg-[#4488ff]/40 transition"
            >
              Continua
            </button>
          </div>
        </div>
      )}

      {/* Phase indicator */}
      {phase === 'START' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl text-[#4488ff] animate-pulse">⚔️ Battaglia!</div>
        </div>
      )}
      {phase === 'ENEMY_TURN' && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-[#ff4444] text-sm animate-pulse">
          Turno del nemico...
        </div>
      )}
    </div>
  );
}
