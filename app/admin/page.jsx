"use client";

import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import Tabs from '@/components/admin/Tabs';
import StatsCards from '@/components/admin/StatsCards';
import PromoCard from '@/components/admin/PromoCard';
import StatisticsChart from '@/components/admin/StatisticsChart';
import RightSidebar from '@/components/admin/RightSidebar';
import { TimeTracker } from '@/components/admin/TimeTracker';
import { TimerList } from '@/components/admin/TimerList';
import { useTimers } from '@/components/admin/context/TimerContext';

const WorkflowDashboard = () => {
  const { urgentTimer } = useTimers();

  return (
    <>
      <Sidebar />

      <main className="admin-main">
        <Header />
        
        <Tabs />
        
        <div className="admin-grid-top">
          <StatsCards />
          <TimeTracker timer={urgentTimer} />
          <PromoCard />
        </div>

        <div className="admin-grid-bottom">
          <StatisticsChart />
          <TimerList />
        </div>
      </main>

      <RightSidebar />
    </>
  );
};

export default WorkflowDashboard;
