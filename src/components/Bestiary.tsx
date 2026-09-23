import { useState } from 'react';
import { KANA_DATABASE, ELEMENT_COLORS, FUSION_RECIPES, Element } from '../data/gameData';

interface BestiaryProps {
  onBack: () => void;
}

const ELEMENT_NAMES: Record<Element, string> = {
  luce: 'Luce', fuoco: 'Fuoco', ghiaccio: 'Ghiaccio', vento: 'Vento',
  fulmine: 'Fulmine', terra: 'Terra', ombra: 'Ombra', fisico: 'Fisico',
};

export function Bestiary({ onBack }: BestiaryProps) {
  const [filter, setFilter] = useState<'all' | 'hiragana' | 'katakana' | 'fusion'>('all');
  const [selectedKana, setSelectedKana] = useState<string | null>(null);
  const [elementFilter, setElementFilter] = useState<Element | 'all'>('all');

  const filteredKana = KANA_DATABASE.filter(k => {
    if (filter === 'hiragana' && k.script !== 'hiragana') return false;
    if (filter === 'katakana' && k.script !== 'katakana') return false;
    if (elementFilter !== 'all' && k.element !== elementFilter) return false;
    return true;
  });

  const selected = selectedKana ? KANA_DATABASE.find(k => k.id === selectedKana) : null;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#0a0a2e] to-[#1a0a2a] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#4488ff]/20">
        <h1 className="text-2xl text-[#4488ff]">📖 Bestiario Kana</h1>
        <button onClick={onBack} className="px-4 py-2 bg-[#4488ff]/10 border border-[#4488ff]/30 rounded text-[#88aaff] hover:bg-[#4488ff]/20 transition">
          ← Indietro
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 p-4 border-b border-[#4488ff]/10">
        <div className="flex gap-1">
          {(['all', 'hiragana', 'katakana', 'fusion'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs transition ${
                filter === f ? 'bg-[#4488ff]/40 text-white' : 'bg-[#4488ff]/10 text-white/50 hover:bg-[#4488ff]/20'
              }`}
            >
              {f === 'all' ? 'Tutti' : f === 'hiragana' ? 'ひらがな' : f === 'katakana' ? 'カタカナ' : 'Fusioni'}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setElementFilter('all')}
            className={`px-2 py-1 rounded text-xs transition ${
              elementFilter === 'all' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30 hover:bg-white/10'
            }`}
          >
            Tutti
          </button>
          {(Object.keys(ELEMENT_COLORS) as Element[]).map(el => (
            <button
              key={el}
              onClick={() => setElementFilter(el)}
              className={`px-2 py-1 rounded text-xs transition ${
                elementFilter === el ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}
              style={{ backgroundColor: elementFilter === el ? ELEMENT_COLORS[el] + '40' : ELEMENT_COLORS[el] + '10' }}
            >
              {ELEMENT_NAMES[el]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filter === 'fusion' ? (
            <div className="space-y-2">
              <h3 className="text-[#ffdd44] text-sm mb-3">📜 Ricette di Fusione ({FUSION_RECIPES.length})</h3>
              {FUSION_RECIPES.map((recipe, i) => (
                <div key={i} className="bg-[#1a1a2e]/80 border border-[#4488ff]/10 rounded p-3 flex items-center gap-3">
                  <div className="flex gap-1">
                    {recipe.inputs.map((input, j) => {
                      const kana = KANA_DATABASE.find(k => k.romaji === input);
                      return (
                        <span key={j} className="w-8 h-8 rounded bg-[#4488ff]/10 flex items-center justify-center text-sm text-[#4488ff]">
                          {kana?.glyph || input}
                        </span>
                      );
                    })}
                  </div>
                  <span className="text-white/30">→</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-[#ffdd44]">{recipe.outputGlyph}</span>
                    <span className="text-white/60 text-sm">{recipe.output} ({recipe.outputMeaning})</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
              {filteredKana.map(kana => (
                <button
                  key={kana.id}
                  onClick={() => setSelectedKana(kana.id)}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-center transition-all hover:scale-110 ${
                    selectedKana === kana.id
                      ? 'border-[#4488ff] bg-[#4488ff]/20 shadow-lg shadow-[#4488ff]/20'
                      : 'border-[#4488ff]/20 bg-[#0a0a2e]/50 hover:border-[#4488ff]/40'
                  }`}
                  style={{ borderColor: selectedKana === kana.id ? ELEMENT_COLORS[kana.element] : undefined }}
                >
                  <span className="text-xl md:text-2xl" style={{ color: ELEMENT_COLORS[kana.element] }}>
                    {kana.glyph}
                  </span>
                  <span className="text-[8px] text-white/30 mt-0.5">{kana.romaji}</span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-4 text-center text-white/20 text-xs">
            {filter !== 'fusion' && `${filteredKana.length} Kana visualizzati`}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-64 md:w-80 border-l border-[#4488ff]/20 p-4 overflow-y-auto bg-[#0a0a1a]/50">
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto rounded-full border-2 flex items-center justify-center text-4xl mb-2"
                style={{ borderColor: ELEMENT_COLORS[selected.element], color: ELEMENT_COLORS[selected.element] }}>
                {selected.glyph}
              </div>
              <div className="text-lg text-white">{selected.glyph} — {selected.romaji}</div>
              <div className="text-xs text-white/40 capitalize">{selected.script} · Riga {selected.row}</div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Elemento</span>
                <span style={{ color: ELEMENT_COLORS[selected.element] }}>{ELEMENT_NAMES[selected.element]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Temperamento</span>
                <span className="text-white/70 capitalize">{selected.temperament}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Tratti</span>
                <span className="text-white/70">{selected.strokes}</span>
              </div>

              <div className="border-t border-[#4488ff]/10 pt-3">
                <div className="text-[#4488ff] text-xs mb-2">Statistiche</div>
                <div className="space-y-1">
                  {[
                    { label: 'HP', value: selected.hp, max: 60, color: '#44ff44' },
                    { label: 'MP', value: selected.mp, max: 40, color: '#4488ff' },
                    { label: 'ATK', value: selected.atk, max: 40, color: '#ff4444' },
                    { label: 'DEF', value: selected.def, max: 30, color: '#ffaa44' },
                    { label: 'AGI', value: selected.agi, max: 30, color: '#ffdd44' },
                    { label: 'MAG', value: selected.mag, max: 40, color: '#aa44ff' },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <span className="text-white/40 w-8 text-xs">{stat.label}</span>
                      <div className="flex-1 h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${(stat.value / stat.max) * 100}%`,
                          backgroundColor: stat.color,
                        }} />
                      </div>
                      <span className="text-white/60 text-xs w-6 text-right">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#4488ff]/10 pt-3">
                <div className="text-[#4488ff] text-xs mb-2">Abilità</div>
                <div className="space-y-1">
                  {selected.abilities.map((ability, i) => (
                    <div key={i} className="bg-[#1a1a2e]/50 rounded p-2">
                      <div className="flex justify-between">
                        <span className="text-white/80 text-xs">{ability.name}</span>
                        <span className="text-xs" style={{ color: ELEMENT_COLORS[ability.element] }}>
                          {ELEMENT_NAMES[ability.element]}
                        </span>
                      </div>
                      <div className="text-white/40 text-xs">{ability.italian} · PWR {ability.power}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
