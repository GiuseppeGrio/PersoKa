import { useState, useEffect, useRef } from 'react';
import { StoryScene } from '../data/gameData';

interface DialogueSceneProps {
  scene: StoryScene;
  onAdvance: () => void;
  textSpeed: number;
  onChoice: (flag: string) => void;
}

export function DialogueScene({ scene, onAdvance, textSpeed, onChoice }: DialogueSceneProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!scene?.text) {
      setIsComplete(true);
      setDisplayedText('');
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    let idx = 0;
    const text = scene.text;

    const type = () => {
      if (idx < text.length) {
        setDisplayedText(text.slice(0, idx + 1));
        idx++;
        timerRef.current = window.setTimeout(type, Math.max(10, 50 / textSpeed));
      } else {
        setIsComplete(true);
      }
    };

    timerRef.current = window.setTimeout(type, 100);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [scene?.id, scene?.text, textSpeed]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (scene?.type === 'choice' && isComplete) {
          if (scene.choices) {
            onChoice(scene.choices[selectedChoice].flag);
          }
        } else if (isComplete) {
          onAdvance();
        } else {
          setIsComplete(true);
          setDisplayedText(scene?.text || '');
        }
      }
      if (scene?.type === 'choice' && isComplete) {
        if (e.key === 'ArrowUp') setSelectedChoice(c => Math.max(0, c - 1));
        if (e.key === 'ArrowDown') setSelectedChoice(c => Math.min((scene.choices?.length || 1) - 1, c + 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isComplete, scene, onAdvance, onChoice, selectedChoice]);

  // Background based on chapter
  const bgGradient = scene?.chapter === 1
    ? 'from-[#0a0a2e] via-[#0f0f3a] to-[#1a0a2a]'
    : 'from-[#0a1a2e] via-[#0f1f3a] to-[#1a1a2a]';

  return (
    <div className={`w-full h-full flex flex-col bg-gradient-to-b ${bgGradient} relative`}>
      {/* Scene illustration area */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Atmospheric elements */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-[#4488ff]"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + Math.sin(i * 1.5) * 30}%`,
                fontSize: `${20 + i * 4}px`,
                opacity: 0.1 + Math.random() * 0.2,
                transform: `rotate(${i * 15}deg)`,
              }}
            >
              {['あ', 'い', 'う', 'か', 'き', 'さ', 'し', 'た'][i]}
            </div>
          ))}
        </div>

        {/* Character portrait area */}
        {scene?.speaker && (
          <div className="relative">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-[#4488ff]/30 flex items-center justify-center bg-[#0a0a2e]/50 backdrop-blur">
              <span className="text-4xl md:text-6xl text-[#4488ff]">
                {scene.speaker === 'Clomp' ? '📖' : '✨'}
              </span>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#4488ff]/20 border border-[#4488ff]/40 rounded px-3 py-1 text-sm text-[#88aaff]">
              {scene.speaker}
            </div>
          </div>
        )}
      </div>

      {/* Dialogue box */}
      <div className="p-4 md:p-8">
        <div
          className="max-w-2xl mx-auto bg-[#0a0a2e]/90 border border-[#4488ff]/30 rounded-lg p-6 relative cursor-pointer"
          onClick={() => {
            if (scene?.type === 'choice' && isComplete && scene.choices) {
              onChoice(scene.choices[selectedChoice].flag);
            } else if (isComplete) {
              onAdvance();
            } else {
              setIsComplete(true);
              setDisplayedText(scene?.text || '');
            }
          }}
        >
          {/* Narration style */}
          {scene?.type === 'narration' && (
            <p className="text-white/80 italic text-lg leading-relaxed">
              {displayedText}
              {!isComplete && <span className="animate-pulse text-[#4488ff]">▌</span>}
            </p>
          )}

          {/* Dialogue style */}
          {scene?.type === 'dialogue' && (
            <div>
              <div className="text-[#4488ff] text-sm mb-2">{scene.speaker}</div>
              <p className="text-white text-lg leading-relaxed">
                {displayedText}
                {!isComplete && <span className="animate-pulse text-[#4488ff]">▌</span>}
              </p>
            </div>
          )}

          {/* Choice style */}
          {scene?.type === 'choice' && (
            <div>
              <p className="text-white/60 text-sm mb-4">{scene.text}</p>
              <div className="space-y-2">
                {scene.choices?.map((choice, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); onChoice(choice.flag); }}
                    className={`w-full text-left py-2 px-4 rounded transition-all ${
                      i === selectedChoice
                        ? 'bg-[#4488ff]/30 border border-[#4488ff]/50 text-white'
                        : 'bg-[#4488ff]/5 border border-transparent text-white/60 hover:text-white'
                    }`}
                  >
                    <span className="text-[#4488ff] mr-2">▸</span>
                    {choice.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Continue indicator */}
          {isComplete && scene?.type !== 'choice' && (
            <div className="absolute bottom-2 right-4 text-[#4488ff]/50 text-sm animate-bounce">
              ▼
            </div>
          )}
        </div>

        <div className="text-center text-white/20 text-xs mt-3">
          Premi Invio o clicca per continuare
        </div>
      </div>
    </div>
  );
}
