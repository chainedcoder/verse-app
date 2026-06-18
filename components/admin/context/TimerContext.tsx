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

interface TimerProviderProps {
  children: React.ReactNode;
  pendingReportsCount?: number;
  newestFeaturedTime?: string | null;
  unsecuredModsCount?: number;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({
  children,
  pendingReportsCount = 0,
  newestFeaturedTime = null,
  unsecuredModsCount = 0,
}) => {
  const [timers, setTimers] = useState<Timer[]>(() => [
    {
      id: '1',
      name: unsecuredModsCount > 0 ? `Enforce Admin MFA (${unsecuredModsCount} unsecured)` : 'All Admins Secured (MFA)',
      totalSeconds: 8 * 60 * 60,
      remainingSeconds: 8 * 60 * 60,
      isRunning: false,
    },
    {
      id: '2',
      name: 'Rotate Featured Poem',
      totalSeconds: 48 * 60 * 60,
      remainingSeconds: 48 * 60 * 60,
      isRunning: false,
    },
    {
      id: '3',
      name: pendingReportsCount > 0 ? `Review Flagged Content (${pendingReportsCount} pending)` : 'All Reports Reviewed',
      totalSeconds: 24 * 60 * 60,
      remainingSeconds: 0,
      isRunning: false,
    },
  ]);

  useEffect(() => {
    // 1. Featured Poem Rotation Countdown
    const getFeaturedRotationSeconds = () => {
      if (!newestFeaturedTime) return 48 * 60 * 60;
      const featuredTime = new Date(newestFeaturedTime).getTime();
      const currentTime = Date.now();
      const cycleMs = 48 * 60 * 60 * 1000; // 48 hours
      const elapsedMs = currentTime - featuredTime;
      const remainingMs = cycleMs - (elapsedMs % cycleMs);
      return Math.max(0, Math.floor(remainingMs / 1000));
    };

    // 2. Security Challenge (MFA Enforcement Countdown)
    const getMfaEnforcementSeconds = () => {
      if (unsecuredModsCount === 0) return 0; // Completed!
      const today = new Date();
      const endOfDay = new Date(today);
      endOfDay.setHours(17, 0, 0, 0); // 5:00 PM today
      if (endOfDay.getTime() < today.getTime()) {
        endOfDay.setDate(endOfDay.getDate() + 1); // 5:00 PM tomorrow
      }
      return Math.max(0, Math.floor((endOfDay.getTime() - today.getTime()) / 1000));
    };

    // 3. Pending Reports SLA Countdown
    const getReportsSlaSeconds = () => {
      return pendingReportsCount > 0 ? 24 * 60 * 60 : 0;
    };

    // Defer the state update to microtask queue to avoid synchronous render warnings
    Promise.resolve().then(() => {
      setTimers([
        {
          id: '1',
          name: unsecuredModsCount > 0 ? `Enforce Admin MFA (${unsecuredModsCount} unsecured)` : 'All Admins Secured (MFA)',
          totalSeconds: 8 * 60 * 60,
          remainingSeconds: getMfaEnforcementSeconds(),
          isRunning: unsecuredModsCount > 0,
        },
        {
          id: '2',
          name: 'Rotate Featured Poem',
          totalSeconds: 48 * 60 * 60,
          remainingSeconds: getFeaturedRotationSeconds(),
          isRunning: true,
        },
        {
          id: '3',
          name: pendingReportsCount > 0 ? `Review Flagged Content (${pendingReportsCount} pending)` : 'All Reports Reviewed',
          totalSeconds: 24 * 60 * 60,
          remainingSeconds: getReportsSlaSeconds(),
          isRunning: pendingReportsCount > 0,
        },
      ]);
    });
  }, [pendingReportsCount, newestFeaturedTime, unsecuredModsCount]);

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
