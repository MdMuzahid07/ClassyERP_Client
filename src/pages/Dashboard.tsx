import React from 'react';
import { useGetDashboardStatsQuery } from '../redux/feature/dashboard/dashboardApi';

export const Dashboard: React.FC = () => {
  const { data, isLoading } = useGetDashboardStatsQuery();

  return (
    <div>
      <h1>Dashboard Page</h1>
    </div>
  );
};
