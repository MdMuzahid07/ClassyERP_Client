import { baseApi } from '../../redux/api/baseApi';
import { type DashboardStats } from '../../types/dashboard';

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard',
      providesTags: ['Dashboard'],
      transformResponse: (response: DashboardResponse) => response.data,
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
