import React, { useEffect, useRef, useState } from 'react';
import { ThreeRenderer } from '../ThreeRenderer';
import { GameEngine } from '../GameEngine';
import audio from '../AudioEngine';
import { getDefaultLevel } from '../../data/defaultLevels';
import TopBar from '../../components/TopBar';
import { LevelFailedModal, LevelCompletedModal } from '../../components/CarOutModals';

export default function CarOutGame({ onHome, onOpenSettings }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const engineRef = useRef(null);

  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(() => getDefaultLevel(1));
  const [isFailedOpen, setIsFailedOpen] = useState(false);
  const [isCompletedOpen, setIsCompletedOpen] = useState(false);
  const [coins, setCoins] = useState(34);

  // Load level helper: synchronous fallback + optional API sync
  const loadLevel = (levelId) => {
    const localLvl = getDefaultLevel(levelId);
    setCurrentLevel(localLvl);
    setIsFailedOpen(false);
    setIsCompletedOpen(false);

    if (engineRef.current) {
      engineRef.current.loadLevel(localLvl);
    }

    fetch(`/api/levels/${levelId}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.level && engineRef.current) {
          setCurrentLevel(data.level);
          engineRef.current.loadLevel(data.level);
        }
      })
      .catch(() => {
        // Silently preserve local bundled levels
      });
  };

  // Initialize ThreeRenderer and GameEngine when mounted
  useEffect(() => {
    if (!containerRef.current) return;

    let isDestroyed = false;

    const initGame = () => {
      if (isDestroyed || !containerRef.current) return;

      try {
        if (rendererRef.current) {
          rendererRef.current.destroy();
          rendererRef.current = null;
        }

        const renderer = new ThreeRenderer(containerRef.current, {
          onCarClicked: (carId) => {
            if (engineRef.current) {
              engineRef.current.handleCarClick(carId);
            }
          },
        });
        rendererRef.current = renderer;

        const engine = new GameEngine({
          renderer,
          onStateChange: () => {},
          onLevelComplete: () => {
            setIsCompletedOpen(true);
            setCoins((prev) => prev + 19);
          },
        });
        engineRef.current = engine;

        // Load initial level
        loadLevel(currentLevelId);

        // Verify layout sizing
        requestAnimationFrame(() => {
          if (containerRef.current && rendererRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              rendererRef.current.handleResize(rect.width, rect.height);
            }
          }
        });
      } catch (err) {
        console.error('CarOutGame initialization handled error:', err);
      }
    };

    initGame();

    return () => {
      isDestroyed = true;
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
      engineRef.current = null;
    };
  }, []);

  // React to level ID changes
  useEffect(() => {
    if (engineRef.current) {
      loadLevel(currentLevelId);
    }
  }, [currentLevelId]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none bg-[#5a6572] overflow-hidden">
      {/* 3D WebGL Canvas Viewport - 100% full screen on both mobile & desktop */}
      <div className="relative w-full h-full overflow-hidden">
        {/* 3D WebGL Canvas Container */}
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full cursor-pointer select-none"
        />

        {/* Top HUD & Bottom 3 Cyan Pill Buttons */}
        <TopBar
          level={currentLevel}
          coins={coins}
          onHome={onHome}
          onRestart={() => {
            audio.playClick();
            engineRef.current?.restart();
          }}
          onHint={() => {
            audio.playClick();
            engineRef.current?.requestHint();
          }}
          onSkip={() => {
            audio.playClick();
            setCurrentLevelId((prev) => prev + 1);
          }}
          onRemoveCar={() => {
            audio.playDriveOff();
            if (engineRef.current && currentLevel) {
              const remaining = currentLevel.vehicles.find(
                (v) => !engineRef.current.exitedCarIds.has(v.id)
              );
              if (remaining) {
                engineRef.current.handleCarClick(remaining.id);
              }
            }
          }}
          onOpenSettings={onOpenSettings}
        />

        {/* Level Failed Modal */}
        <LevelFailedModal
          isOpen={isFailedOpen}
          coins={coins}
          onRevive={() => {
            setIsFailedOpen(false);
            engineRef.current?.undo();
          }}
          onSkip={() => {
            setIsFailedOpen(false);
            setCurrentLevelId((prev) => prev + 1);
          }}
          onTryAgain={() => {
            setIsFailedOpen(false);
            engineRef.current?.restart();
          }}
        />

        {/* Level Completed ("Wonderful!") Modal */}
        <LevelCompletedModal
          isOpen={isCompletedOpen}
          coins={coins}
          coinsAwarded={19}
          onNext={() => {
            setIsCompletedOpen(false);
            setCurrentLevelId((prev) => prev + 1);
          }}
        />
      </div>
    </div>
  );
}
