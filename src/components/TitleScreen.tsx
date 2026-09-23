import { useState, useEffect } from 'react';

interface TitleScreenProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  onBestiary: () => void;
  textSpeed: number;
  musicVolume: number;
  onTextSpeedChange: (v: number) => void;
  onMusicVolumeChange: (v: number) => void;
}

export function TitleScreen({ onNewGame, onLoadGame, onBestiary, textSpeed, musicVolume, onTextSpeedChange, onMusicVolumeChange }: TitleScreenProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [glowPhase, setGlowPhase] = useState(0);
  const [particles, setParticles] = useState<{ x: number; y: number; char: string; speed: number; opacity: number }[]>([]);

  useEffect(() => {
    const kanaChars = 'あいうえおかきくけこさしすせそたちつてと'.split('');
    const p = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      char: kanaChars[Math.floor(Math.random() * kanaChars.length)],
      speed: 0.2 + Math.random() * 0.5,
      opacity: 0.1 + Math.random() * 0.3,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowPhase(p => (p + 0.02) % (Math.PI * 2));
      setParticles(prev => prev.map(p => ({
        ...p,
        y: (p.y - p.speed + 100) % 100,
        opacity: 0.1 + Math.sin(Date.now() * 0.001 + p.x) * 0.15,
      })));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const hasSave = !!localStorage.getItem('clomp_save_0');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a2e] via-[#0f0f3a] to-[#1a0a2a]" />
      
      {/* Floating kana particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute text-[#4488ff] pointer-events-none select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            fontSize: `${14 + Math.random() * 10}px`,
            transform: `rotate(${Math.sin(glowPhase + i) * 15}deg)`,
          }}
        >
          {p.char}
        </div>
      ))}

      {/* Glow circle */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, rgba(68,136,255,${0.3 + Math.sin(glowPhase) * 0.2}) 0%, transparent 70%)`,
          top: '20%',
        }}
      />

      {/* Title */}
      <div className="relative z-10 text-center">
        <div className="mb-2 text-[#4488ff]/60 text-sm tracking-[0.5em] uppercase">Un JRPG di parole perdute</div>
        <h1 className="text-5xl md:text-7xl font-bold mb-2" style={{
          background: 'linear-gradient(135deg, #4488ff, #88aaff, #ffffff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 40px rgba(68,136,255,0.3)',
        }}>
          Clomp
        </h1>
        <div className="text-xl md:text-2xl text-[#88aaff]/80 mb-1 tracking-wider">
          e il Sillabario Spezzato
        </div>
        <div className="text-sm text-white/30 mt-4 mb-12">
          「ことばのかけらを集めよう」
        </div>

        {/* Menu */}
        <div className="space-y-3 min-w-[240px]">
          <button
            onClick={onNewGame}
            className="w-full py-3 px-8 bg-[#4488ff]/10 hover:bg-[#4488ff]/30 border border-[#4488ff]/30 hover:border-[#4488ff]/60 rounded-lg transition-all duration-300 text-[#88aaff] hover:text-white tracking-wider"
          >
            Nuova Partita
          </button>
          {hasSave && (
            <button
              onClick={onLoadGame}
              className="w-full py-3 px-8 bg-[#4488ff]/10 hover:bg-[#4488ff]/30 border border-[#4488ff]/30 hover:border-[#4488ff]/60 rounded-lg transition-all duration-300 text-[#88aaff] hover:text-white tracking-wider"
            >
              Carica Partita
            </button>
          )}
          <button
            onClick={onBestiary}
            className="w-full py-3 px-8 bg-[#4488ff]/10 hover:bg-[#4488ff]/30 border border-[#4488ff]/30 hover:border-[#4488ff]/60 rounded-lg transition-all duration-300 text-[#88aaff] hover:text-white tracking-wider"
          >
            Bestiario Kana
          </button>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full py-3 px-8 bg-[#4488ff]/10 hover:bg-[#4488ff]/30 border border-[#4488ff]/30 hover:border-[#4488ff]/60 rounded-lg transition-all duration-300 text-[#88aaff] hover:text-white tracking-wider"
          >
            Opzioni
          </button>
        </div>

        {/* Options panel */}
        {showOptions && (
          <div className="mt-6 bg-[#0a0a2e]/90 border border-[#4488ff]/20 rounded-lg p-6 max-w-xs mx-auto">
            <h3 className="text-[#4488ff] mb-4">Opzioni</h3>
            <div className="space-y-4 text-left">
              <div>
                <label className="text-sm text-white/60 block mb-1">Velocità testo: {textSpeed}x</label>
                <input
                  type="range" min="1" max="5" step="1" value={textSpeed}
                  onChange={e => onTextSpeedChange(Number(e.target.value))}
                  className="w-full accent-[#4488ff]"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 block mb-1">Volume musica: {Math.round(musicVolume * 100)}%</label>
                <input
                  type="range" min="0" max="1" step="0.1" value={musicVolume}
                  onChange={e => onMusicVolumeChange(Number(e.target.value))}
                  className="w-full accent-[#4488ff]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-white/20 text-xs">
        Usa tastiera o tocco per giocare · WASD/Frecce per muoversi
      </div>
    </div>
  );
}
