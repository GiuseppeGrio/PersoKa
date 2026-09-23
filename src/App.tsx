import { useState, useCallback } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { DungeonView } from './components/DungeonView';
import { BattleScene } from './components/BattleScene';
import { Bestiary } from './components/Bestiary';
import { HubView } from './components/HubView';
import { DialogueScene } from './components/DialogueScene';
import { Kana, KANA_DATABASE, STORY_SCENES, DUNGEON_MAPS } from './data/gameData';

export type GameState = 'TITLE' | 'HUB' | 'DUNGEON' | 'BATTLE' | 'DIALOGUE' | 'BESTIARY' | 'MENU';

export interface GameSave {
  chapter: number;
  party: Kana[];
  flags: Record<string, boolean>;
  currentDungeon: string | null;
  dungeonFloor: number;
  playerPos: { x: number; y: number; dir: number };
  gold: number;
  items: Record<string, number>;
}

const DEFAULT_SAVE: GameSave = {
  chapter: 1,
  party: [KANA_DATABASE[0]], // Start with あ (A)
  flags: {},
  currentDungeon: null,
  dungeonFloor: 0,
  playerPos: { x: 1, y: 1, dir: 0 },
  gold: 100,
  items: { 'Pozione': 3, 'Pergamena': 1 },
};

function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [save, setSave] = useState<GameSave>(DEFAULT_SAVE);
  const [currentScene, setCurrentScene] = useState(0);
  const [battleTrigger, setBattleTrigger] = useState(false);
  const [textSpeed, setTextSpeed] = useState(1);
  const [musicVolume, setMusicVolume] = useState(0.7);

  const startNewGame = useCallback(() => {
    setSave({ ...DEFAULT_SAVE, party: [KANA_DATABASE[0]] });
    setCurrentScene(0);
    setGameState('DIALOGUE');
  }, []);

  const loadGame = useCallback(() => {
    try {
      const saved = localStorage.getItem('clomp_save_0');
      if (saved) {
        setSave(JSON.parse(saved));
        setGameState('HUB');
      }
    } catch (e) {
      console.error('Load failed', e);
    }
  }, []);

  const saveGame = useCallback(() => {
    try {
      localStorage.setItem('clomp_save_0', JSON.stringify(save));
    } catch (e) {
      console.error('Save failed', e);
    }
  }, [save]);

  const advanceScene = useCallback(() => {
    const scene = STORY_SCENES[currentScene];
    if (scene?.next) {
      const nextIdx = STORY_SCENES.findIndex(s => s.id === scene.next);
      if (nextIdx >= 0) {
        setCurrentScene(nextIdx);
      } else if (scene.next === 'tutorial_battle') {
        setGameState('BATTLE');
        setBattleTrigger(true);
      }
    } else {
      setGameState('DUNGEON');
    }
  }, [currentScene]);

  const handleBattleEnd = useCallback((won: boolean) => {
    if (won) {
      setGameState('DUNGEON');
      setBattleTrigger(false);
    } else {
      setGameState('TITLE');
    }
  }, []);

  const enterDungeon = useCallback((dungeonId: string) => {
    setSave(s => ({ ...s, currentDungeon: dungeonId, dungeonFloor: 0, playerPos: { x: 1, y: 1, dir: 0 } }));
    setGameState('DUNGEON');
  }, []);

  const triggerRandomBattle = useCallback(() => {
    setBattleTrigger(false);
    setGameState('BATTLE');
  }, []);

  const returnToHub = useCallback(() => {
    setGameState('HUB');
    saveGame();
  }, [saveGame]);

  return (
    <div className="w-full h-screen overflow-hidden bg-[#0a0a1a] text-white font-serif">
      {gameState === 'TITLE' && (
        <TitleScreen
          onNewGame={startNewGame}
          onLoadGame={loadGame}
          onBestiary={() => setGameState('BESTIARY')}
          textSpeed={textSpeed}
          musicVolume={musicVolume}
          onTextSpeedChange={setTextSpeed}
          onMusicVolumeChange={setMusicVolume}
        />
      )}
      {gameState === 'DIALOGUE' && (
        <DialogueScene
          scene={STORY_SCENES[currentScene]}
          onAdvance={advanceScene}
          textSpeed={textSpeed}
          onChoice={(flag: string) => {
            setSave(s => ({ ...s, flags: { ...s.flags, [flag]: true } }));
            advanceScene();
          }}
        />
      )}
      {gameState === 'HUB' && (
        <HubView
          save={save}
          onEnterDungeon={enterDungeon}
          onOpenMenu={() => setGameState('MENU')}
          onReturnToDialogue={() => {
            setCurrentScene(0);
            setGameState('DIALOGUE');
          }}
        />
      )}
      {gameState === 'DUNGEON' && (
        <DungeonView
          save={save}
          onSave={saveGame}
          onBattle={triggerRandomBattle}
          onReturn={returnToHub}
          dungeon={DUNGEON_MAPS.find(d => d.id === save.currentDungeon) || DUNGEON_MAPS[0]}
        />
      )}
      {gameState === 'BATTLE' && (
        <BattleScene
          party={save.party}
          onEnd={handleBattleEnd}
          isTutorial={currentScene < 3}
        />
      )}
      {gameState === 'BESTIARY' && (
        <Bestiary onBack={() => setGameState('TITLE')} />
      )}
      {gameState === 'MENU' && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="bg-[#1a1a2e]/90 border border-[#4488ff]/30 rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl text-[#4488ff] mb-6 text-center">Menu</h2>
            <div className="space-y-3">
              <button onClick={() => setGameState('HUB')} className="w-full py-2 px-4 bg-[#4488ff]/20 hover:bg-[#4488ff]/40 rounded transition">Torna alla Città</button>
              <button onClick={() => setGameState('BESTIARY')} className="w-full py-2 px-4 bg-[#4488ff]/20 hover:bg-[#4488ff]/40 rounded transition">Bestiario Kana</button>
              <button onClick={saveGame} className="w-full py-2 px-4 bg-[#4488ff]/20 hover:bg-[#4488ff]/40 rounded transition">Salva Partita</button>
              <button onClick={() => setGameState('TITLE')} className="w-full py-2 px-4 bg-red-900/20 hover:bg-red-900/40 rounded transition">Torna al Titolo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
