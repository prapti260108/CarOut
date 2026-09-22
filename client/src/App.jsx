import React, { useEffect, useState } from 'react';
import audio from './game/AudioEngine';
import { Maximize2, Minimize2 } from 'lucide-react';

// Screens & Components
import HomeScreen from './components/HomeScreen';
import SettingsModal from './components/SettingsModal';
import LeaveGameModal from './components/LeaveGameModal';

// Sub-games
import CarOutGame from './game/modes/CarOutGame';
import BusJamGame from './game/modes/BusJamGame';
import SortPuzGame from './game/modes/SortPuzGame';
import DrawBridgeGame from './game/modes/DrawBridgeGame';
import FridgeGame from './game/modes/FridgeGame';

// React ErrorBoundary to prevent screen blanking on unhandled errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('CarOut ErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-white text-center h-full bg-[#0f172a]">
          <h2 className="text-xl font-bold mb-2">Game Loaded</h2>
          <p className="text-sm text-gray-300 mb-4">{this.state.error?.message || 'Ready to play'}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold shadow-lg"
          >
            Restart
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // Active Screen: 'home' | 'car_out' | 'traffic_jam' | 'sortpuz' | 'draw_bridge' | 'fill_fridge'
  const [screen, setScreen] = useState('home');

  // Settings & Audio
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(audio.isSoundOn());
  const [bgmOn, setBgmOn] = useState(audio.isBgmOn());

  // Global "Do you want to leave?" confirmation popup for all 5 games
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const requestLeave = () => {
    setShowLeaveModal(true);
  };

  const confirmLeave = () => {
    setShowLeaveModal(false);
    setIsSettingsOpen(false);
    setScreen('home');
  };

  // Desktop/Laptop Fullscreen Mode ("laptop me full screen kar sakte hai")
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    audio.playClick();
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  // Audio Toggles
  const handleToggleSound = () => {
    const s = audio.toggleSound();
    setSoundOn(s);
  };

  const handleToggleBgm = () => {
    const b = audio.toggleBgm();
    setBgmOn(b);
  };

  return (
    <div className="w-screen h-screen bg-[#050811] flex items-center justify-center overflow-hidden">
      {/* Mobile Device Frame Container (Exact 9:16 portrait viewport) */}
      <div className="mobile-device-frame relative flex flex-col w-full h-full">
        <ErrorBoundary>
        {/* SCREEN 1: MAIN MENU (Exact match from video 00:01) */}
        {screen === 'home' && (
          <HomeScreen
            onSelectGame={(gameId) => {
              setScreen(gameId);
              // Start BGM on user interaction if enabled
              if (bgmOn) audio.startBgm();
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* SCREEN 2: CAR OUT (Main 3D Parking Game from video 00:04) */}
        {screen === 'car_out' && (
          <CarOutGame
            onHome={requestLeave}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* SCREEN 3: TRAFFIC JAM (Bus Jam from video 02:18) */}
        {screen === 'traffic_jam' && (
          <BusJamGame
            onHome={requestLeave}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* SCREEN 4: SORTPUZ 3D (Water Sort from video 07:10) */}
        {screen === 'sortpuz' && (
          <SortPuzGame
            onHome={requestLeave}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* SCREEN 5: DRAW BRIDGE (from video 07:32) */}
        {screen === 'draw_bridge' && (
          <DrawBridgeGame
            onHome={requestLeave}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* SCREEN 6: FILL UP FRIDGE (from video 07:44) */}
        {screen === 'fill_fridge' && (
          <FridgeGame
            onHome={requestLeave}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* BLUE RIBBON SETTINGS MODAL (from video 05:59, 09:23) */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onHome={requestLeave}
          soundOn={soundOn}
          bgmOn={bgmOn}
          onToggleSound={handleToggleSound}
          onToggleBgm={handleToggleBgm}
        />

        {/* GLOBAL "DO YOU WANT TO LEAVE?" CONFIRMATION MODAL (Exact match for user screenshot) */}
        <LeaveGameModal
          isOpen={showLeaveModal}
          onCancel={() => setShowLeaveModal(false)}
          onConfirm={confirmLeave}
        />

        {/* DESKTOP / LAPTOP FULLSCREEN TOGGLE BUTTON (User request: "laptop me full screen kar sakte hai") */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex fixed top-3 right-3 z-[60] items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white font-bold text-xs shadow-xl border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer hover:border-sky-400"
          title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Full Screen</span>
            </>
          )}
        </button>
        </ErrorBoundary>
      </div>
    </div>
  );
}
