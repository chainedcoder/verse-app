
// Minimal SVGs
const IconBarChart = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
const IconChevronDown = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>;

interface DataPoint {
  day: string;
  ops?: number;
  data?: number;
  empty: boolean;
  tooltipOps?: string;
  tooltipData?: string;
}

const data: DataPoint[] = [
  { day: '27 Jun', ops: 0.88, data: 0.5, empty: false },
  { day: '28 Jun', ops: 0.6, data: 0.35, empty: false },
  { day: '29 Jun', ops: 0.75, data: 0.25, empty: false },
  { day: '30 Jun', empty: true },
  { day: '1 Jul', ops: 0.9, data: 0.48, empty: false, tooltipOps: '87%', tooltipData: '32%' },
  { day: '2 Jul', empty: true },
  { day: '3 Jul', ops: 0.65, data: 0.45, empty: false },
  { day: '4 Jul', ops: 0.55, data: 0.35, empty: false },
];

const yAxis = ['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1'];

const StatisticsChart = () => {
  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)', padding: '24px', borderRadius: '24px', border: 'none', color: '#111827' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1f2937' }}>
            <IconBarChart />
            <h2 style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>Statistics</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#161616' }} />
              <span style={{ color: '#4b5563' }}>Operations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E6F89F' }} />
              <span style={{ color: '#4b5563' }}>Data transfer</span>
            </div>
          </div>
        </div>
        
        <button className="btn" style={{ background: 'white', color: '#111827', border: 'none', padding: '8px 16px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
          2025
          <span style={{ color: '#6b7280' }}><IconChevronDown /></span>
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex', marginTop: '16px', overflowX: 'auto' }}>
        <div style={{ minWidth: '500px', flex: 1, display: 'flex' }}>
          {/* Y-axis */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', paddingRight: '16px', paddingBottom: '32px', height: '100%', flexShrink: 0 }}>
            {yAxis.map((val) => (
              <span key={val}>{val}</span>
            ))}
          </div>

          {/* Chart Area */}
          <div style={{ flex: 1, position: 'relative', height: '100%' }}>
            {/* Grid lines */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '32px' }}>
              {yAxis.map((val) => (
                <div key={val} style={{ width: '100%', borderTop: '1px dashed #e5e7eb', marginTop: '7px' }} />
              ))}
            </div>

            {/* Bars */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '32px', paddingLeft: '16px', paddingRight: '16px' }}>
              {data.map((item, index) => (
                <div key={index} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', width: '48px', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', bottom: '-32px', fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                    {item.day}
                  </div>

                  {item.empty ? (
                    <div style={{ width: '32px', height: '100%', border: '2px dashed #d1d5db', borderRadius: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', opacity: 0.5 }}>
                      <div style={{ width: '12px', height: '12px', background: '#d1d5db', borderRadius: '50%' }} />
                    </div>
                  ) : (
                    <div style={{ width: '32px', height: '100%', position: 'relative' }}>
                      {/* Ops Bar (Black) */}
                      <div 
                        style={{ position: 'absolute', bottom: 0, width: '100%', background: '#161616', borderRadius: '16px 16px 0 0', transition: 'all 0.3s', zIndex: 10, height: `${(item.ops || 0) * 100}%` }}
                      >
                        <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '50%', position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)' }} />
                        {item.tooltipOps && (
                          <div style={{ position: 'absolute', right: '-48px', top: '8px', background: '#161616', color: 'white', fontSize: '12px', padding: '4px 8px', borderRadius: '8px' }}>
                            {item.tooltipOps}
                          </div>
                        )}
                      </div>
                      
                      {/* Data Bar (Yellow) */}
                      <div 
                        style={{ position: 'absolute', bottom: 0, width: '100%', background: '#E6F89F', borderRadius: '16px', transition: 'all 0.3s', zIndex: 20, height: `${(item.data || 0) * 100}%` }}
                      >
                        <div style={{ width: '12px', height: '12px', background: '#161616', borderRadius: '50%', position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)' }} />
                        {item.tooltipData && (
                          <div style={{ position: 'absolute', left: '-48px', top: '8px', background: '#E6F89F', color: '#161616', fontWeight: 500, fontSize: '12px', padding: '4px 8px', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                            {item.tooltipData}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsChart;
