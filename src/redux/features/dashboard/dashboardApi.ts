import { baseApi } from '../../api/baseApi';

export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalSales: number;
  lowStockProducts: {
    _id: string;
    name: string;
    sku: string;
    stockQuantity: number;
    sellingPrice: number;
  }[];
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
