import React from 'react';
import { useGetDashboardStatsQuery } from '../../redux/features/dashboard/dashboardApi';

export const DashboardHome: React.FC = () => {
  const { data, isLoading } = useGetDashboardStatsQuery();

  return (
    <div>
      <h1>Dashboard Overview Page</h1>
    </div>
  );
};
export default DashboardHome;
