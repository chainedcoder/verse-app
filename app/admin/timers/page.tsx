"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { TimerList } from '@/components/admin/TimerList';
import { useTimers } from '@/components/admin/context/TimerContext';
import { Plus } from 'lucide-react';
import styles from './TimersPage.module.css';

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
    <div className={styles.container}>
      <div className={styles.sidebarWrapper}>
        <Sidebar />
      </div>

      <div className={styles.mainContent}>
        <h1 className={styles.title}>Timers & Countdowns</h1>

        <div className={styles.contentWrapper}>
          {/* Create New Timer Form */}
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle}>Create New Timer</h2>
            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Timer Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Deep Work, Review" 
                  className={styles.input} 
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Duration (Minutes)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={minutes} 
                  onChange={e => setMinutes(e.target.value)} 
                  className={styles.input} 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className={styles.submitBtn}
              >
                <Plus size={20} /> Create Timer
              </button>
            </form>
          </div>

          {/* List of Timers */}
          <div className={styles.timersListWrapper}>
            <TimerList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimersPage;
