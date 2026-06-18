"use client";

import React, { useState } from 'react';
import { TimerList } from '@/components/admin/TimerList';
import { useTimers } from '@/components/admin/context/TimerContext';
import { Plus } from 'lucide-react';

const TimersPage = () => {
  const { addTimer } = useTimers();
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('25');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && minutes) {
      addTimer(name, parseInt(minutes, 10) * 60);
      setName('');
      setMinutes('25');
    }
  };

  return (
    <main className="admin-main">

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Timers &amp; Countdowns</h1>
          <p className="admin-page-subtitle">Create and manage admin task timers.</p>
        </div>
      </div>

      <div className="timers-page-layout">
        {/* Create Form */}
        <div className="timers-form-card">
          <h2 className="timers-form-title">Create New Timer</h2>
          <form onSubmit={handleCreate}>
            <div className="timers-form-group">
              <label className="timers-form-label">Timer Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Deep Work, Review"
                className="input"
                required
              />
            </div>
            <div className="timers-form-group">
              <label className="timers-form-label">Duration (Minutes)</label>
              <input
                type="number"
                min="1"
                value={minutes}
                onChange={e => setMinutes(e.target.value)}
                className="input"
                required
              />
            </div>
            <button type="submit" className="timers-submit-btn">
              <Plus size={18} /> Create Timer
            </button>
          </form>
        </div>

        {/* Timer List */}
        <TimerList />
      </div>
    </main>
  );
};

export default TimersPage;
