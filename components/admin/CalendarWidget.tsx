import React, { useState, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';

import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Upload, RefreshCw, X } from 'lucide-react';
import './CalendarWidget.css'; // We will create this for custom overrides

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  type?: 'dark' | 'light';
  avatars?: string[];
}

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Weekly Team Sync',
    description: 'Discuss progress on projects',
    start: new Date(currentYear, currentMonth, 23, 8, 30),
    end: new Date(currentYear, currentMonth, 23, 10, 0),
    type: 'dark',
    avatars: ['https://i.pravatar.cc/100?img=1', 'https://i.pravatar.cc/100?img=2', 'https://i.pravatar.cc/100?img=3']
  },
  {
    id: '2',
    title: 'Onboarding Session',
    description: 'Introduction for new hires',
    start: new Date(currentYear, currentMonth, 25, 10, 0),
    end: new Date(currentYear, currentMonth, 25, 11, 0),
    type: 'light',
    avatars: ['https://i.pravatar.cc/100?img=4', 'https://i.pravatar.cc/100?img=5']
  }
];

export const CalendarWidget = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(today);
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', start: today, end: new Date(today.getTime() + 60 * 60 * 1000), type: 'dark' as 'dark' | 'light'
  });

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        start,
        end,
        type: 'dark'
      });
      setModalOpen(true);
    },
    []
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      setEditingId(event.id);
      setFormData({
        title: event.title,
        description: event.description || '',
        start: event.start,
        end: event.end,
        type: event.type || 'dark'
      });
      setModalOpen(true);
    },
    []
  );

  const saveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setEvents(prev => prev.map(ev => ev.id === editingId ? { ...ev, ...formData } : ev));
    } else {
      setEvents(prev => [...prev, { id: Date.now().toString(), ...formData, avatars: [] }]);
    }
    setModalOpen(false);
  };

  const deleteEvent = () => {
    if (editingId) {
      setEvents(prev => prev.filter(ev => ev.id !== editingId));
      setModalOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const summaries = [...text.matchAll(/SUMMARY:(.*)/g)].map(m => m[1]);
      
      const newEvents = summaries.map((summary, idx) => {
        const d = new Date(currentYear, currentMonth, 15 + Math.floor(Math.random() * 10), 9 + Math.floor(Math.random() * 5));
        return {
          id: `imported-${Date.now()}-${idx}`,
          title: summary,
          description: 'Imported from iCal',
          start: d,
          end: new Date(d.getTime() + 60 * 60 * 1000),
          type: 'light' as const
        };
      });

      setEvents(prev => [...prev, ...newEvents]);
      setSyncModalOpen(false);
    };
    reader.readAsText(file);
  };

  const simulateGoogleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const d = new Date(currentYear, currentMonth, 26, 14, 0); // Friday 2PM
      setEvents(prev => [...prev, {
        id: `gcal-${Date.now()}`,
        title: 'Google Sync Meeting',
        description: 'Synced from Google Calendar',
        start: d,
        end: new Date(d.getTime() + 90 * 60 * 1000),
        type: 'dark',
        avatars: ['https://i.pravatar.cc/100?img=6']
      }]);
      setIsSyncing(false);
      setSyncModalOpen(false);
    }, 1500);
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const isDark = event.type === 'dark';
    const isDayView = view === 'day';
    
    return (
      <div className={`calendar-event-card ${isDayView ? 'day-view' : ''} ${isDark ? 'dark-theme' : 'light-theme'}`}>
        <div className={`calendar-event-content ${isDayView ? 'flex-1' : ''}`}>
          <h4 className={`calendar-event-title ${isDayView ? 'base-text' : 'sm-text'}`}>{event.title}</h4>
          {event.description && !isDayView && <p className="calendar-event-desc">{event.description}</p>}
        </div>
        
        {event.avatars && event.avatars.length > 0 && (
          <div className={`calendar-event-avatars ${isDayView ? 'ml-auto' : 'mt-auto pt-1'}`}>
            {event.avatars.map((avatar, idx) => (
              <img key={idx} src={avatar} alt="Avatar" className="calendar-event-avatar" />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Custom Toolbar matching the old UI design
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };
    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    return (
      <div className="calendar-toolbar">
        <div className="calendar-toolbar-group">
          <button type="button" onClick={goToBack} className="calendar-action-btn">Prev</button>
          <button type="button" onClick={goToToday} className="calendar-action-btn">Today</button>
          <button type="button" onClick={goToNext} className="calendar-action-btn">Next</button>
        </div>
        <span className="calendar-toolbar-title">{toolbar.label}</span>
        <div className="calendar-toolbar-group">
          <button 
            type="button"
            onClick={() => toolbar.onView('month')}
            className={`calendar-action-btn ${view === 'month' ? 'active' : ''}`}
          >Month</button>
          <button 
            type="button"
            onClick={() => toolbar.onView('week')}
             className={`calendar-action-btn ${view === 'week' ? 'active' : ''}`}
          >Week</button>
           <button 
            type="button"
            onClick={() => toolbar.onView('day')}
             className={`calendar-action-btn ${view === 'day' ? 'active' : ''}`}
          >Day</button>
          <button 
            type="button"
            onClick={() => setSyncModalOpen(true)}
            className="calendar-icon-btn"
            title="Sync / Import"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-widget-container">
      <div className="calendar-widget-override">
        <BigCalendar
          localizer={localizer}
          events={events}
          date={date}
          view={view}
          onNavigate={setDate}
          onView={setView}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          components={{
            event: EventComponent,
            toolbar: CustomToolbar
          }}
          step={30}
          timeslots={2}
          min={new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0)} // Start at 7 AM
          max={new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0)} // End at 7 PM
        />
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="calendar-modal-overlay">
          <div className="calendar-modal-header">
            <h3>{editingId ? 'Edit Event' : 'Add Event'}</h3>
            <button onClick={() => setModalOpen(false)}><X size={20}/></button>
          </div>
          
          <form onSubmit={saveEvent} className="calendar-modal-form">
            <input 
              required
              type="text" 
              placeholder="Event Title" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="calendar-input"
            />
            <input 
              type="text" 
              placeholder="Description" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="calendar-input"
            />
            
            <div className="calendar-form-row">
              <div className="calendar-form-group">
                <label>Start Time</label>
                <input 
                  type="datetime-local"
                  value={format(formData.start, "yyyy-MM-dd'T'HH:mm")}
                  onChange={e => setFormData({...formData, start: new Date(e.target.value)})}
                  className="calendar-input"
                />
              </div>
              <div className="calendar-form-group">
                <label>End Time</label>
                <input 
                  type="datetime-local"
                  value={format(formData.end, "yyyy-MM-dd'T'HH:mm")}
                  onChange={e => setFormData({...formData, end: new Date(e.target.value)})}
                  className="calendar-input"
                />
              </div>
            </div>

            <div className="calendar-form-row">
              <div className="calendar-form-group">
                <label>Style</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as 'dark'|'light'})}
                  className="calendar-input"
                >
                  <option value="dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                </select>
              </div>
            </div>

            <div className="calendar-modal-footer">
              {editingId && (
                <button type="button" onClick={deleteEvent} className="calendar-btn-danger">
                  Delete
                </button>
              )}
              <div className="spacer"></div>
              <button type="button" onClick={() => setModalOpen(false)} className="calendar-btn-secondary">
                Cancel
              </button>
              <button type="submit" className="calendar-btn-primary">
                {editingId ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sync/Import Modal */}
      {syncModalOpen && (
        <div className="calendar-modal-overlay center-content">
          <button onClick={() => setSyncModalOpen(false)} className="calendar-close-btn"><X size={20}/></button>
          
          <div className="calendar-sync-icon">
            <CalendarIcon size={28} />
          </div>
          <h3 className="calendar-sync-title">Sync Calendar</h3>
          <p className="calendar-sync-desc">Import events from an .ics file or sync directly with your Google Calendar.</p>
          
          <div className="calendar-sync-actions">
            <label className="calendar-upload-zone">
              <input type="file" accept=".ics" className="hidden" onChange={handleFileUpload} />
              <Upload size={20} className="upload-icon" />
              <span className="upload-title">Import .ics File</span>
              <span className="upload-desc">Apple Calendar, Outlook, etc.</span>
            </label>
            
            <div className="calendar-divider">
              <div className="line"></div>
              <span>Or</span>
              <div className="line"></div>
            </div>

            <button 
              onClick={simulateGoogleSync} 
              disabled={isSyncing}
              className="calendar-google-btn"
            >
              {isSyncing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Syncing with Google...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Connect Google Calendar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
