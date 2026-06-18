import { useRouter } from 'next/navigation';
import { useTimers, type Timer } from './context/TimerContext';

// Inline SVGs
const IconArrowUpRight = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>;
const IconPlay = () => <svg width="20" height="20" fill="currentColor" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: '4px' }}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const IconPause = () => <svg width="20" height="20" fill="currentColor" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;

export const TimeTracker = ({ timer }: { timer?: Timer | null }) => {
  const router = useRouter();
  const { toggleTimer } = useTimers();

  if (!timer) {
    return (
      <div className="card admin-stat-card yellow" style={{ background: 'var(--bg-card)', borderRadius: '32px', padding: '24px', flex: 1, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px', minWidth: '280px', border: 'none' }}>
        <button onClick={() => router.push('/timers')} style={{ position: 'absolute', top: '24px', right: '24px', width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', color: 'var(--text-primary)' }}>
          <IconArrowUpRight />
        </button>
        <p style={{ color: 'var(--text-secondary)' }}>No active timers</p>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = timer.totalSeconds > 0 ? timer.remainingSeconds / timer.totalSeconds : 0;
  // Circle radius 80, Circumference = 2 * Math.PI * 80 = 502.65
  const offset = 502 - (502 * progress);

  return (
    <div className="card admin-stat-card yellow" style={{ background: 'var(--bg-card)', borderRadius: '32px', padding: '24px', flex: 1, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '340px', minWidth: '280px', border: 'none' }}>
       <button onClick={() => router.push('/timers')} style={{ position: 'absolute', top: '24px', right: '24px', width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', zIndex: 10, color: 'var(--text-primary)' }}>
        <IconArrowUpRight />
      </button>
      <h3 style={{ fontSize: '22px', fontWeight: 400, width: '100%', textAlign: 'left', marginBottom: '24px', color: 'var(--text-primary)', paddingRight: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{timer.name}</h3>

      <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', marginBottom: '32px' }}>
        {/* Dashed tick marks */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 180 180">
          <circle cx="90" cy="90" r="80" stroke="var(--text-primary)" strokeWidth="2" fill="none" strokeDasharray="3 10" />
          {/* Yellow progress arc */}
          <circle cx="90" cy="90" r="80" stroke="#f6d365" strokeWidth="12" fill="none" strokeDasharray="502" strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '44px', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px', color: 'var(--text-primary)' }}>{formatTime(timer.remainingSeconds)}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Work Time</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => toggleTimer(timer.id)} style={{ width: '52px', height: '52px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', color: 'var(--text-primary)' }}>
            {!timer.isRunning ? <IconPlay /> : <IconPause />}
          </button>
        </div>
        <button style={{ width: '52px', height: '52px', background: '#2a2a2a', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline><path d="M12 2v2"></path></svg>
        </button>
      </div>
    </div>
  );
};