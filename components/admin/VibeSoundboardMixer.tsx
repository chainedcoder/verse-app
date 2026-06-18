"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Soundscape {
  id: string;
  name: string;
  src: string;
  icon: string;
  defaultVol: number;
  color: string;
  bgGlow: string;
}

export const VibeSoundboardMixer: React.FC = () => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [volumes, setVolumes] = useState<Record<string, number>>({
    'rain': 60,
    'lofi': 40,
    'hearth': 30,
    'drone': 20
  });

  const audioRefs = {
    'rain': useRef<HTMLAudioElement | null>(null),
    'lofi': useRef<HTMLAudioElement | null>(null),
    'hearth': useRef<HTMLAudioElement | null>(null),
    'drone': useRef<HTMLAudioElement | null>(null)
  };

  const soundscapes: Soundscape[] = [
    { id: 'rain', name: 'Midnight Rain', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', icon: '🌧️', defaultVol: 60, color: '#3b82f6', bgGlow: 'rgba(59, 130, 246, 0.05)' },
    { id: 'lofi', name: 'Lofi Serenade', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', icon: '🎹', defaultVol: 40, color: '#ec4899', bgGlow: 'rgba(236, 72, 153, 0.05)' },
    { id: 'hearth', name: 'Hearth Crackle', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', icon: '🔥', defaultVol: 30, color: '#f97316', bgGlow: 'rgba(249, 115, 22, 0.05)' },
    { id: 'drone', name: 'Astral Drone', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', icon: '🌌', defaultVol: 20, color: '#8b5cf6', bgGlow: 'rgba(139, 92, 246, 0.05)' }
  ];

  useEffect(() => {
    soundscapes.forEach(s => {
      const audio = audioRefs[s.id as keyof typeof audioRefs]?.current;
      if (audio) {
        audio.volume = volumes[s.id] / 100;
        audio.loop = true;
      }
    });
  }, [volumes]);

  const toggleSound = (id: string) => {
    const audio = audioRefs[id as keyof typeof audioRefs]?.current;
    if (!audio) return;

    if (playing === id) {
      audio.pause();
      setPlaying(null);
    } else {
      if (playing) {
        audioRefs[playing as keyof typeof audioRefs]?.current?.pause();
      }
      audio.play().catch(() => {});
      setPlaying(id);
    }
  };

  const adjustVolume = (id: string, amount: number) => {
    setVolumes(prev => {
      const nextVol = Math.max(0, Math.min(100, prev[id] + amount));
      const audio = audioRefs[id as keyof typeof audioRefs]?.current;
      if (audio) audio.volume = nextVol / 100;
      return { ...prev, [id]: nextVol };
    });
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', backdropFilter: 'blur(4px)', border: 'none', padding: '24px', borderRadius: '32px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', minHeight: '440px', boxSizing: 'border-box' }}>
      
      {/* HTML5 Audio Elements */}
      {soundscapes.map(s => (
        <audio key={s.id} ref={audioRefs[s.id as keyof typeof audioRefs]} src={s.src} preload="none" />
      ))}

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <circle cx="15" cy="15" r="2" />
          </svg>
          Atmospheric Audio Matrix
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Concentric volume tuners for default platform soundscapes</p>
      </div>

      {/* Visual 2x2 Matrix Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1 }}>
        {soundscapes.map((s) => {
          const isPlaying = playing === s.id;
          const vol = volumes[s.id];
          const rotationAngle = (vol / 100) * 270 - 135; // Map volume to -135deg to +135deg

          return (
            <div 
              key={s.id} 
              style={{ 
                background: isPlaying ? s.bgGlow : 'var(--bg-primary)', 
                border: isPlaying ? `1.5px solid ${s.color}40` : '1px solid var(--border-secondary)', 
                borderRadius: '24px', 
                padding: '16px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease-in-out',
                position: 'relative'
              }}
            >
              {/* Channel Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                <span style={{ fontSize: '14px' }}>{s.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
              </div>

              {/* Concentric Rotary Dial Knob */}
              <div 
                onClick={() => toggleSound(s.id)}
                style={{ 
                  position: 'relative', 
                  width: '72px', 
                  height: '72px', 
                  borderRadius: '50%', 
                  background: 'var(--bg-secondary)', 
                  border: '1.5px solid var(--border-secondary)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer',
                  margin: '12px 0'
                }}
              >
                {/* Dial Pointer Dot */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '8px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isPlaying ? s.color : 'var(--text-secondary)',
                    transform: `rotate(${rotationAngle}deg)`,
                    transformOrigin: '50% 28px',
                    transition: 'transform 0.15s ease'
                  }}
                />
                
                {/* Play/Pause Symbol */}
                <span style={{ fontSize: '11px', fontWeight: 700, color: isPlaying ? s.color : 'var(--text-secondary)' }}>
                  {isPlaying ? 'ON' : 'OFF'}
                </span>
              </div>

              {/* Click-to-Tune volume buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'space-between' }}>
                <button 
                  onClick={() => adjustVolume(s.id, -10)}
                  style={{ border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)', width: '24px', height: '24px', borderRadius: '50%', fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  -
                </button>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{vol}%</span>
                <button 
                  onClick={() => adjustVolume(s.id, 10)}
                  style={{ border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)', width: '24px', height: '24px', borderRadius: '50%', fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default VibeSoundboardMixer;
