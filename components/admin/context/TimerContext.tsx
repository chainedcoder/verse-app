"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Timer {
  id: string;
  name: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

interface TimerContextType {
  timers: Timer[];
  addTimer: (name: string, seconds: number) => void;
  toggleTimer: (id: string) => void;
  deleteTimer: (id: string) => void;
  urgentTimer: Timer | null;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timers, setTimers] = useState<Timer[]>([
    { id: '1', name: 'Deep Work', totalSeconds: 25 * 60, remainingSeconds: 2 * 60 + 35, isRunning: true },
    { id: '2', name: 'Team Sync', totalSeconds: 60 * 60, remainingSeconds: 45 * 60, isRunning: false },
    { id: '3', name: 'Break', totalSeconds: 5 * 60, remainingSeconds: 5 * 60, isRunning: false },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => prev.map(t => {
        if (t.isRunning && t.remainingSeconds > 0) {
          return { ...t, remainingSeconds: t.remainingSeconds - 1 };
        }
        if (t.isRunning && t.remainingSeconds <= 0) {
          return { ...t, isRunning: false, remainingSeconds: 0 };
        }
        return t;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTimer = (name: string, seconds: number) => {
    setTimers(prev => [...prev, { 
      id: Date.now().toString(), 
      name, 
      totalSeconds: seconds, 
      remainingSeconds: seconds, 
      isRunning: false 
    }]);
  };

  const toggleTimer = (id: string) => {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, isRunning: !t.isRunning } : t));
  };

  const deleteTimer = (id: string) => {
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  // The urgent timer is the running one with the least time left, or just the one with the least time left
  const urgentTimer = [...timers]
    .filter(t => t.remainingSeconds > 0)
    .sort((a, b) => {
      if (a.isRunning && !b.isRunning) return -1;
      if (!a.isRunning && b.isRunning) return 1;
      return a.remainingSeconds - b.remainingSeconds;
    })[0] || timers[0] || null;

  return (
    <TimerContext.Provider value={{ timers, addTimer, toggleTimer, deleteTimer, urgentTimer }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimers = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimers must be used within a TimerProvider');
  return context;
};
