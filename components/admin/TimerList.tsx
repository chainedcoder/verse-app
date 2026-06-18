import { useTimers } from './context/TimerContext';

const IconPlay = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const IconPause = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const TimerList = () => {
  const { timers, toggleTimer } = useTimers();

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeCount = timers.filter(t => t.remainingSeconds > 0).length;

  return (
    <div className="timers-list-card">
      <div className="timers-list-header">
        <h2 className="timers-list-title">Active Timers</h2>
        <span className="timers-count-badge">{activeCount}</span>
      </div>

      <div className="timers-list-items">
        {timers.map(timer => (
          <div
            key={timer.id}
            className={`timer-item${timer.remainingSeconds === 0 ? ' timer-item--done' : ''}`}
          >
            {timer.remainingSeconds > 0 ? (
              <button
                onClick={() => toggleTimer(timer.id)}
                className="timer-toggle-btn"
                aria-label={timer.isRunning ? 'Pause' : 'Resume'}
              >
                {timer.isRunning ? <IconPause /> : <IconPlay />}
              </button>
            ) : (
              <div className="timer-done-dot">
                <IconCheck />
              </div>
            )}

            <div className="timer-item-body">
              <div className="timer-item-name">{timer.name}</div>
              <div className="timer-item-time">
                {timer.remainingSeconds === 0
                  ? 'Completed'
                  : `${formatTime(timer.remainingSeconds)} left`}
              </div>
            </div>
          </div>
        ))}

        {timers.length === 0 && (
          <div className="timers-empty">No timers yet. Create one on the left.</div>
        )}
      </div>
    </div>
  );
};
