"use client";

import Sidebar from '@/components/admin/Sidebar';
import { Search, ChevronDown, Lock, Filter, Activity, BarChart, TrendingUp, DollarSign } from 'lucide-react';
import styles from './FinanceDashboard.module.css';

const FinanceDashboard = () => {
  return (
    <div className={styles.container}>
      <div className={styles.sidebarWrapper}>
        <Sidebar />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.mainGrid}>
          
          {/* Column 1 */}
          <div className={styles.col1}>
            {/* VISA Card */}
            <div className={styles.visaCard}>
              <div className={styles.visaHeader}>
                <span className={styles.visaLogo}>VISA</span>
                <button className={styles.outlineBtn}>
                  Direct Debits <ChevronDown size={16} />
                </button>
              </div>
              <p className={styles.textGraySm}>Linked to main account</p>
              <h3 className={styles.cardNumber}>**** 2719</h3>
              
              <div className={styles.actionBtns}>
                <button className={styles.btnDark}>Receive</button>
                <button className={styles.btnLight}>Send</button>
              </div>
              
              <div className={styles.visaFooter}>
                 <div>
                   <p className={styles.textGraySm}>Monthly regular fee</p>
                   <span className={styles.feeAmount}>$ 25.00</span>
                 </div>
                 <button className={styles.redBtn}>
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                   Edit cards limitation
                 </button>
              </div>
            </div>

            {/* Annual Profits */}
            <div className={styles.profitsCard}>
              <div className={styles.profitsHeader}>
                <h3 className={styles.cardTitle}>Annual profits</h3>
                <button className={styles.outlineBtn}>
                  2023 <ChevronDown size={16} />
                </button>
              </div>
              <div className={styles.profitsChart}>
                {/* Concentric circles */}
                <div className={styles.circle1}>
                  <span className={styles.circle1Label}>$ 14K</span>
                  <div className={styles.circle2}>
                    <span className={styles.circle2Label}>$ 9.3K</span>
                    <div className={styles.circle3}>
                      <span className={styles.circle3Label}>$ 6.8K</span>
                      <div className={styles.circle4}>
                        <span className={styles.circle4Label}>$ 4K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className={styles.col2}>
            {/* Income / Paid */}
            <div className={styles.incomeCards}>
              <div className={styles.incomeCard}>
                <div>
                   <div className={styles.iconCircle}>
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                   </div>
                   <p className={styles.textGraySm}>Total income</p>
                   <span className={styles.incomeAmount}>$ 23,194.80</span>
                </div>
                <button className={`${styles.outlineBtn} ${styles.btnStart}`}>
                  Weekly <ChevronDown size={16} />
                </button>
              </div>

              <div className={styles.incomeCard}>
                <div>
                   <div className={styles.iconCircle}>
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                   </div>
                   <p className={styles.textGraySm}>Total paid</p>
                   <span className={styles.incomeAmount}>$ 8,145.20</span>
                </div>
                <div className={styles.paidRightCol}>
                  <button className={`${styles.outlineBtn} ${styles.mb10}`}>
                    Weekly <ChevronDown size={16} />
                  </button>
                  <button className={styles.redBtn}>
                    <TrendingUp size={16} />
                    View on chart mode
                  </button>
                </div>
              </div>
            </div>

            {/* Activity manager */}
            <div className={styles.activityManager}>
              <div className={styles.activityHeader}>
                <h3 className={styles.cardTitle}>Activity manager</h3>
                <div className={styles.activityTools}>
                  <button className={styles.toolBtn}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </button>
                  <button className={styles.toolBtn}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14h6v6H4zM14 4h6v6h-6zM14 14h6v6h-6zM4 4h6v6H4z"></path></svg>
                  </button>
                  <button className={styles.outlineBtn}>
                    <Filter size={16} /> Filters
                  </button>
                </div>
              </div>

              <div className={styles.searchBar}>
                <div className={styles.searchInputWrapper}>
                  <Search className={styles.searchIcon} size={20} />
                  <input type="text" placeholder="Search in activities..." className={styles.searchInput} />
                </div>
                <div className={styles.filterTags}>
                  <button className={styles.outlineBtn}>
                    Team <div className={styles.filterDot}></div>
                  </button>
                  <button className={styles.outlineBtn}>
                    Insights <span className={styles.filterClose}>×</span>
                  </button>
                  <button className={styles.outlineBtn}>
                    Today <span className={styles.filterClose}>×</span>
                  </button>
                </div>
              </div>

              <div className={styles.activityWidgets}>
                {/* $43.20 Chart */}
                <div className={styles.barChartWidget}>
                  <div className={styles.chartValueRow}>
                    <span className={styles.chartValue}>$ 43.20</span>
                    <span className={styles.chartCurrency}>USD</span>
                  </div>
                  {/* Fake Bar Chart */}
                  <div className={styles.chartBars}>
                    {[30, 40, 20, 60, 80, 40, 30, 70, 50, 20].map((h, i) => (
                      <div key={i} className={i % 2 === 0 ? styles.chartBarRed : styles.chartBarGray} style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                  <div className={styles.chartDots}>
                    <div className={styles.dotLongGray}></div>
                    <div className={styles.dotRed}></div>
                    <div className={styles.dotGray}></div>
                  </div>
                </div>

                {/* Business plans */}
                <div className={styles.plansWidget}>
                  <div className={styles.plansHeader}>
                    <span className={styles.plansTitle}>Business plans</span>
                    <button className={styles.plansMoreBtn}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg></button>
                  </div>
                  
                  <div className={styles.plansList}>
                    <div className={styles.plansLine}></div>
                    <div className={styles.planItem}>
                      <div className={styles.planIcon}><DollarSign size={14} /></div>
                      <button className={styles.planDropdown}>
                        Bank loans <ChevronDown size={16} />
                      </button>
                    </div>
                    <div className={styles.planItem}>
                      <div className={styles.planIcon}><Activity size={14} /></div>
                      <span className={styles.planLabel}>Accounting</span>
                    </div>
                    <div className={styles.planItem}>
                      <div className={styles.planIcon}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                      <span className={styles.planLabel}>HR management</span>
                    </div>
                  </div>
                </div>

                {/* Wallet Verification */}
                <div className={styles.walletWidget}>
                  <div className={styles.walletIcon}>
                     <svg viewBox="0 0 100 100" className={styles.progressSvg} style={{ transform: 'none', color: '#d25f46' }} fill="none" stroke="currentColor" strokeWidth="4">
                       <circle cx="50" cy="50" r="20" />
                       <path d="M50 10 L50 25 M50 90 L50 75 M10 50 L25 50 M90 50 L75 50 M22 22 L32 32 M78 78 L68 68 M22 78 L32 68 M78 22 L68 32" strokeLinecap="round"/>
                     </svg>
                  </div>
                  <h4 className={styles.walletTitle}>Wallet Verification</h4>
                  <p className={styles.walletDesc}>Enable 2-step verification to secure your wallet.</p>
                  <button className={styles.walletBtn}>Enable</button>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className={styles.col3}>
             
             {/* System Lock & 13 Days */}
             <div className={styles.lockRow}>
                <div className={styles.lockWidget}>
                  <div className={styles.lockHeader}>
                    <Lock size={20} style={{ color: '#1c1c1c' }} />
                    <span className={styles.lockLabel}>System Lock</span>
                  </div>
                  
                  <div className={styles.circularProgress}>
                    <svg className={styles.progressSvg}>
                      <circle cx="64" cy="64" r="60" stroke="#f4f5f5" strokeWidth="8" fill="none" />
                      <circle cx="64" cy="64" r="60" stroke="#d25f46" strokeWidth="8" fill="none" strokeDasharray="377" strokeDashoffset="240" strokeLinecap="round" />
                    </svg>
                    <div className={styles.progressCenter}>
                      <span className={styles.progressValue}>36%</span>
                      <span className={styles.progressDesc}>Growth rate</span>
                    </div>
                  </div>
                </div>

                <div className={styles.daysWidget}>
                  <div>
                    <div className={styles.daysIcon}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <span className={styles.daysValue}>13 Days</span>
                    <span className={styles.daysDesc}>109 hours, 23 minutes</span>
                  </div>
                  
                  <div className={styles.dotsGrid}>
                    {[...Array(14)].map((_, i) => (
                      <div key={i} className={i < 8 ? styles.gridDotRed : styles.gridDotGray}></div>
                    ))}
                    {[...Array(12)].map((_, i) => (
                      <div key={i + 14} className={i < 4 ? styles.gridDotRed : styles.gridDotGray}></div>
                    ))}
                  </div>
                </div>
             </div>

             {/* Chart 2022/2023 */}
             <div className={styles.yearChart}>
                <div className={styles.yearIcon}>
                  <BarChart size={14} style={{ color: '#1c1c1c' }} />
                </div>
                <div className={styles.yearBars}>
                  {/* Grid lines */}
                  <div className={styles.yearGrid}>
                    <div className={styles.gridHLine}></div>
                    <div className={styles.gridHLine}></div>
                    <div className={styles.gridHLine}></div>
                  </div>
                  <div className={styles.yearGridV}>
                    <div className={styles.gridVLine}></div>
                  </div>

                  <div className={styles.yearCol}>
                    <div className={styles.yearLabelWhite}>2022</div>
                  </div>
                  <div className={styles.yearCol}>
                    <div className={styles.yearLabelRed}>2023</div>
                    <div className={styles.yearBarLine}></div>
                  </div>
                </div>
             </div>

             {/* Main Stocks */}
             <div className={styles.stocksWidget}>
               <div className={styles.stocksHeader}>
                 <div className={styles.stocksIcon}>
                   <Activity size={18} style={{ color: '#1c1c1c' }} />
                 </div>
                 <span className={styles.stocksValue}>$ 16,073.49</span>
               </div>
               
               {/* Fake Spline chart */}
               <div className={styles.splineChart}>
                 <svg viewBox="0 0 400 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }} fill="none" stroke="#f1d0ca" strokeWidth="4">
                   <path d="M0,50 Q40,20 80,60 T160,40 T240,70 T320,30 T400,50" />
                   <path d="M0,60 Q40,30 80,70 T160,50 T240,80 T320,40 T400,60" stroke="#d25f46" />
                 </svg>
               </div>

               <div className={styles.stocksFooter}>
                 <div>
                   <h3 className={styles.stocksFooterTitle}>Main Stocks</h3>
                   <p className={styles.stocksFooterDesc}>Extended & Limited</p>
                 </div>
                 <div className={styles.stocksBadge}>
                   + 9.3%
                 </div>
               </div>
             </div>

             {/* Review rating */}
             <div className={styles.ratingWidget}>
               <button className={styles.closeBtn}>
                 <span style={{ fontSize: 20 }}>×</span>
               </button>
               <div className={styles.ratingDots}>
                 <div className={styles.dotRed} style={{ backgroundColor: '#1c1c1c' }}></div>
                 <div className={styles.dotGray}></div>
                 <div className={styles.dotGray}></div>
               </div>
               
               <p className={styles.ratingLabel}>Review rating</p>
               <h3 className={styles.ratingTitle}>How is your business<br/>management going?</h3>
               
               <div className={styles.smileysRow}>
                 {/* Smileys */}
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 10a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M15 10a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M8 15a4 4 0 0 0 8 0"/></svg>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 10a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M15 10a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><line x1="8" y1="15" x2="16" y2="15"/></svg>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 10a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M15 10a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M8 15h8"/></svg>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 10a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M15 10a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M16 15a4 4 0 0 0-8 0"/></svg>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 10a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M15 10a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M16 15a4 4 0 0 0-8 0"/></svg>
               </div>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;