"use client";

import Sidebar from '@/components/admin/Sidebar';
import { ArrowUpRight, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { TimeTracker } from '@/components/admin/TimeTracker';
import { CalendarWidget } from '@/components/admin/CalendarWidget';
import { useTimers } from '@/components/admin/context/TimerContext';
import styles from './EmployeeDashboard.module.css';

const EmployeeDashboard = () => {
  const { urgentTimer } = useTimers();

  return (
    <div className={styles.container}>
      <div className={styles.sidebarWrapper}>
        <Sidebar />
      </div>

      <div className={styles.mainContent}>
        <h1 className={styles.title}>Welcome in, Nixtio</h1>

        {/* Top Stats Section */}
        <div className={styles.statsSection}>
          <div className={styles.statsBars}>
            <div className={styles.statBarContainer} style={{ width: 96, flexShrink: 0 }}>
              <span className={styles.statBarLabel}>Interviews</span>
              <div className={styles.statBarDark}>15%</div>
            </div>
            <div className={styles.statBarContainer} style={{ width: 96, flexShrink: 0, marginLeft: -16, zIndex: 10, position: 'relative' }}>
              <span className={styles.statBarLabel} style={{ paddingLeft: 24 }}>Hired</span>
              <div className={styles.statBarYellow}>15%</div>
            </div>
            <div className={styles.statBarContainer} style={{ flex: 1, flexShrink: 0, marginLeft: -16, zIndex: 0, position: 'relative' }}>
              <span className={styles.statBarLabel} style={{ paddingLeft: 24 }}>Project time</span>
              <div className={styles.statBarGradient}>
                <div className={styles.statBarGradientBg}></div>
                <span style={{ fontSize: 14, zIndex: 10, fontWeight: 500 }}>60%</span>
              </div>
            </div>
            <div className={styles.statBarContainer} style={{ width: 96, flexShrink: 0, marginLeft: 16, position: 'relative' }}>
              <span className={styles.statBarLabel}>Output</span>
              <div className={styles.statBarBorder}>10%</div>
            </div>
          </div>

          <div className={styles.statNumbers}>
            <div className={styles.statNumberItem}>
              <div className={styles.statNumberRow}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span className={styles.statNumberValue}>78</span>
              </div>
              <span className={styles.statNumberLabel}>Employe</span>
            </div>
            <div className={styles.statNumberItem}>
              <div className={styles.statNumberRow}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                <span className={styles.statNumberValue}>56</span>
              </div>
              <span className={styles.statNumberLabel}>Hirings</span>
            </div>
            <div className={styles.statNumberItem}>
              <div className={styles.statNumberRow}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                <span className={styles.statNumberValue}>203</span>
              </div>
              <span className={styles.statNumberLabel}>Projects</span>
            </div>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className={styles.mainGrid}>
          
          {/* Left Column */}
          <div className={styles.leftCol}>
            {/* Profile Card */}
            <div className={styles.profileCard}>
               <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop" alt="Profile" className={styles.profileImg} />
               <div className={styles.profileGradient}></div>
               <div className={styles.profileInfo}>
                 <div>
                   <h3 className={styles.profileName}>Lora Piterson</h3>
                   <p className={styles.profileRole}>UX/UI Designer</p>
                 </div>
                 <div className={styles.profileBadge}>
                   $1,200
                 </div>
               </div>
            </div>

            {/* Accordion Menu */}
            <div className={styles.accordionMenu}>
               <div className={styles.accordionItem} style={{ padding: '20px 24px' }}>
                 <span className={styles.accordionLabel}>Pension contributions</span>
                 <ChevronDown size={20} className={styles.accordionIcon} />
               </div>
               
               <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(229,231,235,0.6)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, cursor: 'pointer' }}>
                   <span className={styles.accordionLabel}>Devices</span>
                   <ChevronUp size={20} className={styles.accordionIcon} />
                 </div>
                 <div className={styles.deviceRow}>
                   <div className={styles.deviceItem}>
                     <div className={styles.deviceIcon}>
                       <div className={styles.deviceScreen}>
                          <div className={styles.deviceKeyboard}></div>
                       </div>
                     </div>
                     <div className={styles.deviceInfo}>
                       <h5>MacBook Air</h5>
                       <p>Version M1</p>
                     </div>
                   </div>
                   <MoreHorizontal size={20} className={styles.accordionIcon} />
                 </div>
               </div>

               <div className={styles.accordionItem} style={{ padding: '20px 24px' }}>
                 <span className={styles.accordionLabel}>Compensation Summary</span>
                 <ChevronDown size={20} className={styles.accordionIcon} />
               </div>
               <div className={styles.accordionItem} style={{ padding: '20px 24px' }}>
                 <span className={styles.accordionLabel}>Employee Benefits</span>
                 <ChevronDown size={20} className={styles.accordionIcon} />
               </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className={styles.middleCol}>
            <div className={styles.progressContainer}>
              {/* Progress Card */}
              <div className={styles.progressCard}>
                <button className={styles.iconBtn}>
                  <ArrowUpRight size={20} style={{ color: '#4b5563' }} />
                </button>
                <h3 className={styles.cardTitle}>Progress</h3>
                <div className={styles.progressStats}>
                  <span className={styles.progressMainStat}>6.1 h</span>
                  <span className={styles.progressSubStat}>Work Time<br/>this week</span>
                </div>
                
                <div className={styles.progressChart}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className={styles.progressDay}>
                      <div className={styles.progressDayBar}>
                        {i === 4 ? (
                          <div className={styles.barActive}>
                            <div className={styles.barActiveTooltip}>
                              5h 23m
                            </div>
                          </div>
                        ) : i === 0 || i === 6 ? (
                          <div className={styles.barEmpty}></div>
                        ) : (
                          <div className={styles.barNormal} style={{ height: `${40 + Math.random() * 50}%` }}></div>
                        )}
                      </div>
                      <div className={styles.dot} />
                      <span className={styles.progressDayLabel}>{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <TimeTracker timer={urgentTimer} />
            </div>

            {/* Interactive Calendar Component */}
            <CalendarWidget />
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>
            {/* Onboarding top card */}
            <div className={styles.onboardingCard}>
              <div className={styles.onboardingHeader}>
                <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>Onboarding</h3>
                <span className={styles.onboardingPercent}>18%</span>
              </div>
              <div className={styles.onboardingBars}>
                <div className={styles.onboardingBarYellow}>
                  <span className={styles.onboardingLabel}>Task</span>
                  <span className={styles.onboardingValue}>30%</span>
                </div>
                <div className={styles.onboardingBarDark}>
                  <span className={styles.onboardingValue}>25%</span>
                </div>
                <div className={styles.onboardingBarGray}>
                  <span className={styles.onboardingValue}>0%</span>
                </div>
              </div>
            </div>

            {/* Dark Task List */}
            <div className={styles.tasksCard}>
               <div className={styles.tasksHeader}>
                 <h3 className={styles.tasksTitle}>Onboarding Task</h3>
                 <span className={styles.tasksCount}>2/8</span>
               </div>

               <div className={styles.taskList}>
                 {/* Task Item 1 */}
                 <div className={styles.taskItem}>
                   <div className={styles.taskIconDark}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                   </div>
                   <div className={styles.taskInfo}>
                     <h4 className={styles.taskNameDone}>Interview</h4>
                     <p className={styles.taskTime}>Sep 13, 08:30</p>
                   </div>
                   <div className={styles.taskCheck}>
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                   </div>
                 </div>

                 {/* Task Item 2 */}
                 <div className={styles.taskItem}>
                   <div className={styles.taskIconDark}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                   </div>
                   <div className={styles.taskInfo}>
                     <h4 className={styles.taskNameDone}>Team Meeting</h4>
                     <p className={styles.taskTime}>Sep 13, 10:30</p>
                   </div>
                   <div className={styles.taskCheck}>
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                   </div>
                 </div>

                 {/* Task Item 3 */}
                 <div className={styles.taskItem}>
                   <div className={styles.taskIconLight}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><circle cx="8" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="16" cy="10" r="1" fill="currentColor"/></svg>
                   </div>
                   <div className={styles.taskInfo}>
                     <h4 className={styles.taskName}>Project Update</h4>
                     <p className={styles.taskTimeLight}>Sep 13, 13:00</p>
                   </div>
                   <div className={styles.taskUncheck} />
                 </div>

                 {/* Task Item 4 */}
                 <div className={styles.taskItem}>
                   <div className={styles.taskIconLight}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                   </div>
                   <div className={styles.taskInfo}>
                     <h4 className={styles.taskName}>Discuss Q3 Goals</h4>
                     <p className={styles.taskTimeLight}>Sep 13, 14:45</p>
                   </div>
                   <div className={styles.taskUncheck} />
                 </div>

                 {/* Task Item 5 */}
                 <div className={styles.taskItem}>
                   <div className={styles.taskIconLight}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                   </div>
                   <div className={styles.taskInfo}>
                     <h4 className={styles.taskName}>HR Policy Review</h4>
                     <p className={styles.taskTimeLight}>Sep 13, 16:30</p>
                   </div>
                   <div className={styles.taskUncheck} />
                 </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDashboard;