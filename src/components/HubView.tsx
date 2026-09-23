import { useState } from 'react';
import { GameSave } from '../App';
import { DUNGEON_MAPS, RUMORS, CHARACTERS, ELEMENT_COLORS } from '../data/gameData';

interface HubViewProps {
  save: GameSave;
  onEnterDungeon: (id: string) => void;
  onOpenMenu: () => void;
  onReturnToDialogue: () => void;
}

interface HubLocation {
  id: string;
  name: string;
  description: string;
  icon: string;
  x: number;
  y: number;
  action?: string;
}

const HUB_LOCATIONS: HubLocation[] = [
  { id: 'school', name: 'Liceo Kotonoha', description: 'La scuola dove tutto è iniziato', icon: '🏫', x: 30, y: 25, action: 'dungeon_d1' },
  { id: 'port', name: 'Porto Dimenticato', description: 'Il mare mormora nomi perduti', icon: '⚓', x: 70, y: 70, action: 'dungeon_d2' },
  { id: 'mall', name: 'Magazzino Hoshi', description: 'Specchi che mostrano chi non sei', icon: '🏬', x: 75, y: 30, action: 'dungeon_d3' },
  { id: 'shrine', name: 'Santuario', description: 'Guarigione e salvataggio', icon: '⛩️', x: 20, y: 60 },
  { id: 'shop', name: 'Negozio', description: 'Oggetti e pergamene', icon: '🏪', x: 50, y: 45 },
  { id: 'inkwell', name: 'Il Calamaio', description: 'Fusione dei Kana', icon: '🖋️', x: 40, y: 70 },
  { id: 'home', name: 'Casa di Clomp', description: 'Il tuo letto, il tuo diario', icon: '🏠', x: 15, y: 35 },
  { id: 'library', name: 'Biblioteca', description: 'Pagine senza fine', icon: '📚', x: 60, y: 55 },
];

export function HubView({ save, onEnterDungeon, onOpenMenu, onReturnToDialogue }: HubViewProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showRumors, setShowRumors] = useState(false);
  const [showDialogues, setShowDialogues] = useState(false);

  const currentRumors = RUMORS.filter(r => r.chapter === save.chapter);
  const selected = HUB_LOCATIONS.find(l => l.id === selectedLocation);

  const handleLocationAction = (location: HubLocation) => {
    if (location.action?.startsWith('dungeon_')) {
      const dungeonId = location.action.replace('dungeon_', '');
      onEnterDungeon(dungeonId);
    } else if (location.id === 'shrine') {
      // Heal party
      alert('Il santuario ti avvolge in una luce calda. Il party è stato curato!');
    } else if (location.id === 'home') {
      // Save and rest
      try {
        localStorage.setItem('clomp_save_0', JSON.stringify(save));
        alert('Hai riposato. Partita salvata.');
      } catch (e) {
        alert('Salvataggio fallito.');
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#0a1a2e] via-[#0f1f3a] to-[#0a0a1a] relative overflow-hidden">
      {/* Stars/particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-[#4488ff]/10">
        <div>
          <h1 className="text-xl text-[#4488ff]">Kotonoha</h1>
          <p className="text-xs text-white/30">Capitolo {save.chapter} · 💰 {save.gold}G</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowRumors(true)} className="px-3 py-1.5 bg-[#ffdd44]/10 border border-[#ffdd44]/30 rounded text-[#ffdd44] text-sm hover:bg-[#ffdd44]/20 transition">
            📢 Voci
          </button>
          <button onClick={() => setShowDialogues(true)} className="px-3 py-1.5 bg-[#4488ff]/10 border border-[#4488ff]/30 rounded text-[#88aaff] text-sm hover:bg-[#4488ff]/20 transition">
            💬 Dialoghi
          </button>
          <button onClick={onOpenMenu} className="px-3 py-1.5 bg-[#4488ff]/10 border border-[#4488ff]/30 rounded text-[#88aaff] text-sm hover:bg-[#4488ff]/20 transition">
            ☰ Menu
          </button>
        </div>
      </div>

      {/* Party display */}
      <div className="relative z-10 flex gap-2 px-4 py-2 border-b border-[#4488ff]/10">
        {save.party.map((kana, i) => (
          <div key={i} className="flex items-center gap-1 bg-[#0a0a2e]/50 rounded px-2 py-1">
            <span className="text-lg" style={{ color: ELEMENT_COLORS[kana.element] }}>{kana.glyph}</span>
            <span className="text-xs text-white/40">{kana.romaji}</span>
          </div>
        ))}
      </div>

      {/* Map area */}
      <div className="flex-1 relative z-10 p-4">
        <div className="relative w-full h-full max-w-3xl mx-auto">
          {/* City background */}
          <div className="absolute inset-0 rounded-lg border border-[#4488ff]/10 bg-[#0a0a2e]/30 overflow-hidden">
            {/* Simple city illustration with CSS */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#1a2a3a]/50 to-transparent" />
            <div className="absolute bottom-[33%] left-[10%] w-12 h-20 bg-[#1a1a3a]/60 rounded-t" />
            <div className="absolute bottom-[33%] left-[25%] w-8 h-16 bg-[#1a1a3a]/40 rounded-t" />
            <div className="absolute bottom-[33%] left-[45%] w-16 h-24 bg-[#1a1a3a]/50 rounded-t" />
            <div className="absolute bottom-[33%] right-[20%] w-10 h-18 bg-[#1a1a3a]/40 rounded-t" />
            <div className="absolute bottom-[33%] right-[10%] w-14 h-22 bg-[#1a1a3a]/50 rounded-t" />
            {/* Water */}
            <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-[#0a2a4a]/40 to-transparent" />
          </div>

          {/* Location markers */}
          {HUB_LOCATIONS.map(loc => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc.id)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                selectedLocation === loc.id ? 'scale-125 z-20' : 'hover:scale-110 z-10'
              }`}
              style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            >
              <div className={`flex flex-col items-center ${
                selectedLocation === loc.id ? 'animate-bounce' : ''
              }`}>
                <div className={`text-2xl md:text-3xl p-2 rounded-full transition-all ${
                  selectedLocation === loc.id
                    ? 'bg-[#4488ff]/30 ring-2 ring-[#4488ff]'
                    : 'bg-[#0a0a2e]/60 hover:bg-[#4488ff]/20'
                }`}>
                  {loc.icon}
                </div>
                <span className="text-[10px] text-white/60 mt-1 whitespace-nowrap bg-[#0a0a2e]/80 px-1 rounded">
                  {loc.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Location detail panel */}
      {selected && (
        <div className="relative z-10 mx-4 mb-4 bg-[#0a0a2e]/90 border border-[#4488ff]/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg text-[#4488ff]">{selected.icon} {selected.name}</h3>
              <p className="text-sm text-white/50">{selected.description}</p>
            </div>
            <div className="flex gap-2">
              {selected.action && (
                <button
                  onClick={() => handleLocationAction(selected)}
                  className="px-4 py-2 bg-[#4488ff]/20 border border-[#4488ff]/40 rounded text-[#4488ff] hover:bg-[#4488ff]/40 transition"
                >
                  Entra →
                </button>
              )}
              {selected.id === 'shrine' && (
                <button
                  onClick={() => handleLocationAction(selected)}
                  className="px-4 py-2 bg-green-900/20 border border-green-500/40 rounded text-green-400 hover:bg-green-900/40 transition"
                >
                  Cura party
                </button>
              )}
              {selected.id === 'home' && (
                <button
                  onClick={() => handleLocationAction(selected)}
                  className="px-4 py-2 bg-[#ffdd44]/20 border border-[#ffdd44]/40 rounded text-[#ffdd44] hover:bg-[#ffdd44]/40 transition"
                >
                  Riposa e salva
                </button>
              )}
              <button
                onClick={() => setSelectedLocation(null)}
                className="px-3 py-2 bg-red-900/10 border border-red-500/20 rounded text-red-400/60 hover:bg-red-900/30 transition"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rumors modal */}
      {showRumors && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]/80 p-4">
          <div className="bg-[#0a0a2e] border border-[#ffdd44]/30 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-[#ffdd44]">📢 Voci di Città</h2>
              <button onClick={() => setShowRumors(false)} className="text-white/40 hover:text-white">✕</button>
            </div>
            <p className="text-white/40 text-sm mb-4">Capitolo {save.chapter} — Scegli una voce da amplificare o smentire:</p>
            <div className="space-y-3">
              {currentRumors.map(rumor => (
                <div key={rumor.id} className="bg-[#1a1a2e]/50 border border-[#ffdd44]/10 rounded p-3">
                  <p className="text-white/70 text-sm italic mb-2">"{rumor.text}"</p>
                  <p className="text-white/30 text-xs mb-2">Effetto: {rumor.description}</p>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 text-xs bg-[#ffdd44]/10 text-[#ffdd44] rounded hover:bg-[#ffdd44]/30 transition">
                      Amplifica
                    </button>
                    <button className="px-2 py-1 text-xs bg-red-900/10 text-red-400 rounded hover:bg-red-900/30 transition">
                      Smentisci
                    </button>
                  </div>
                </div>
              ))}
              {currentRumors.length === 0 && (
                <p className="text-white/30 text-sm">Nessuna voce disponibile per questo capitolo.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dialogues modal */}
      {showDialogues && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]/80 p-4">
          <div className="bg-[#0a0a2e] border border-[#4488ff]/30 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-[#4488ff]">💬 Personaggi</h2>
              <button onClick={() => setShowDialogues(false)} className="text-white/40 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              {CHARACTERS.map(char => (
                <div key={char.name} className="bg-[#1a1a2e]/50 border border-[#4488ff]/10 rounded p-3 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: char.color + '20', border: `1px solid ${char.color}40` }}>
                    {char.name === 'Clomp' ? '📖' : '✨'}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: char.color }}>{char.name}</div>
                    <div className="text-xs text-white/40">{char.role}</div>
                    <div className="text-xs text-white/50 mt-1">{char.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setShowDialogues(false); onReturnToDialogue(); }}
              className="w-full mt-4 py-2 bg-[#4488ff]/10 border border-[#4488ff]/30 rounded text-[#88aaff] hover:bg-[#4488ff]/20 transition"
            >
              Riprologa la storia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
