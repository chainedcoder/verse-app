import { useTimers } from './context/TimerContext';

const IconPlay = () => <svg width="18" height="18" fill="currentColor" stroke="none" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const IconPause = () => <svg width="18" height="18" fill="currentColor" stroke="none" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;

export const TimerList = () => {
  const { timers, toggleTimer } = useTimers();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card admin-stat-card" style={{ background: '#2a2a2a', color: 'white', flex: 1, minWidth: '320px', maxHeight: '400px', overflowY: 'auto', border: 'none', padding: '24px' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '0 8px' }}>
         <h3 style={{ fontSize: '22px', fontWeight: 400, letterSpacing: '0.02em', color: 'white' }}>Active Timers</h3>
         <span style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '-0.02em' }}>{timers.filter(t => t.remainingSeconds > 0).length}</span>
       </div>

       <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
         {timers.map(timer => (
           <div key={timer.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '24px', background: timer.remainingSeconds === 0 ? 'transparent' : '#3b3b3b', border: timer.remainingSeconds === 0 ? '1px solid #3b3b3b' : 'none' }}>
             {timer.remainingSeconds > 0 ? (
               <button onClick={() => toggleTimer(timer.id)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1c1c1c', border: 'none', cursor: 'pointer' }}>
                 {timer.isRunning ? <IconPause /> : <span style={{ marginLeft: '4px' }}><IconPlay /></span>}
               </button>
             ) : (
               <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#3b3b3b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
               </div>
             )}
             
             <div style={{ flex: 1, overflow: 'hidden' }}>
               <h4 style={{ fontWeight: 400, fontSize: '17px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: timer.remainingSeconds === 0 ? '#9ca3af' : 'white', textDecoration: timer.remainingSeconds === 0 ? 'line-through' : 'none' }}>
                 {timer.name}
               </h4>
               <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                 {timer.remainingSeconds === 0 ? 'Completed' : `${formatTime(timer.remainingSeconds)} left`}
               </p>
             </div>

             {timer.remainingSeconds === 0 ? (
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#E6F89F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
             ) : (
               <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#2a2a2a' }} />
             )}
           </div>
         ))}
         {timers.length === 0 && (
           <p style={{ color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>No timers available.</p>
         )}
       </div>
    </div>
  );
};
