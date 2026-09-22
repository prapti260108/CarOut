import React from 'react';
import audio from '../game/AudioEngine';

export default function HomeScreen({ onSelectGame, onOpenSettings }) {
  const games = [
    {
      id: 'car_out',
      title: 'Car Out',
      top: '43.65%',
      left: '27.61%',
      width: '45.22%',
      height: '6.64%',
      cardImg: '/assets/btn_card_car_out.png',
    },
    {
      id: 'traffic_jam',
      title: 'Traffic Jam',
      top: '51.46%',
      left: '27.61%',
      width: '45.22%',
      height: '6.64%',
      cardImg: '/assets/btn_card_traffic_jam.png',
    },
    {
      id: 'sortpuz',
      title: 'SortPuz 3D',
      top: '59.47%',
      left: '27.61%',
      width: '45.22%',
      height: '6.64%',
      cardImg: '/assets/btn_card_sortpuz.png',
    },
    {
      id: 'draw_bridge',
      title: 'Draw Bridge',
      top: '67.58%',
      left: '27.61%',
      width: '45.22%',
      height: '6.64%',
      cardImg: '/assets/btn_card_draw_bridge.png',
    },
    {
      id: 'fill_fridge',
      title: 'Fill Up Fridge',
      top: '75.49%',
      left: '27.61%',
      width: '45.22%',
      height: '6.64%',
      cardImg: '/assets/btn_card_fill_fridge.png',
    },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#050811] flex items-center justify-center">
      {/* Ambient background glow for desktop/laptop screens */}
      <div className="absolute inset-0 hidden sm:block pointer-events-none overflow-hidden">
        <img
          src="/assets/home_full.png"
          alt="Ambient Background"
          className="w-full h-full object-cover blur-3xl opacity-35 scale-125 brightness-90"
        />
        <div className="absolute inset-0 bg-[#050811]/60 backdrop-blur-md" />
        <div className="absolute inset-0 bg-radial from-sky-500/10 via-transparent to-[#050811]/90" />
      </div>

      {/* Centered Phone Canvas on desktop, full screen on mobile */}
      <div className="relative w-full max-w-[440px] sm:max-w-[480px] md:max-w-[510px] lg:max-w-[530px] h-full max-h-[920px] sm:max-h-[96vh] aspect-[9/19.5] overflow-hidden bg-[#0a1128] shadow-2xl rounded-none sm:rounded-[36px] sm:border-2 sm:border-sky-400/30 sm:shadow-[0_0_60px_rgba(56,189,248,0.3)] transition-all">
        {/* 1. Exact 1:1 Background from user reference screenshot */}
        <img
          src="/assets/home_full.png"
          alt="Car Out Home"
          className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
          draggable={false}
        />

      {/* 2. Top-Left Interactive Settings Button */}
      <button
        onClick={() => {
          audio.playClick();
          onOpenSettings();
        }}
        className="absolute cursor-pointer rounded-xl transition-all duration-100 hover:brightness-110 active:scale-90 active:brightness-90 focus:outline-none z-20"
        style={{
          top: '6.64%',
          left: '3.91%',
          width: '14.13%',
          height: '4.69%',
        }}
        title="Settings"
      >
        <img
          src="/assets/btn_settings.png"
          alt="Settings"
          className="w-full h-full object-fill pointer-events-none drop-shadow-md"
        />
      </button>

      {/* 3. Five Interactive 3D Game Buttons */}
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => {
            audio.playClick();
            onSelectGame(game.id);
          }}
          className="absolute cursor-pointer rounded-2xl transition-all duration-100 hover:brightness-105 active:scale-95 active:translate-y-1 focus:outline-none z-20"
          style={{
            top: game.top,
            left: game.left,
            width: game.width,
            height: game.height,
          }}
          title={game.title}
        >
          <img
            src={game.cardImg}
            alt={game.title}
            className="w-full h-full object-fill pointer-events-none rounded-2xl shadow-lg"
          />
        </button>
      ))}
      </div>
    </div>
  );
}
