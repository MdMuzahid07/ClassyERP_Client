import { baseApi } from '../../api/baseApi';
import { type Sale } from '../../../types/sale';

export interface SalesResponse {
  success: boolean;
  message: string;
  data: Sale[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface CreateSaleRequest {
  customer: string;
  products: {
    product: string;
    quantity: number;
  }[];
}

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query<
      { sales: Sale[]; meta: { page: number; limit: number; total: number; totalPage: number } },
      { page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.set('page', String(params.page));
          if (params.limit) queryParams.set('limit', String(params.limit));
        }
        return `/sales?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.sales.map(({ _id }) => ({ type: 'Sale' as const, id: _id })),
              { type: 'Sale', id: 'LIST' },
            ]
          : [{ type: 'Sale', id: 'LIST' }],
      transformResponse: (response: SalesResponse) => ({
        sales: response.data,
        meta: response.meta ?? { page: 1, limit: 10, total: response.data.length, totalPage: 1 },
      }),
    }),
    createSale: builder.mutation<{ success: boolean; data: Sale }, CreateSaleRequest>({
      query: (saleData) => ({
        url: '/sales',
        method: 'POST',
        body: saleData,
      }),
      invalidatesTags: ['Sale', 'Product', 'Dashboard'],
    }),
  }),
});

export const { useGetSalesQuery, useCreateSaleMutation } = salesApi;
export default salesApi;
