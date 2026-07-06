import { baseApi } from '../../api/baseApi';
import type { Product } from '../products/productsApi';

export interface SaleItem {
  product: string | Product;
  quantity: number;
  price: number;
}

export interface Sale {
  _id: string;
  customer: string;
  products: SaleItem[];
  grandTotal: number;
  createdAt: string;
}

export interface SalesResponse {
  success: boolean;
  data: Sale[];
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
    getSales: builder.query<SalesResponse, void>({
      query: () => '/sales',
      providesTags: ['sales'],
    }),
    createSale: builder.mutation<{ success: boolean; data: Sale }, CreateSaleRequest>({
      query: (saleData) => ({
        url: '/sales',
        method: 'POST',
        body: saleData,
      }),
      invalidatesTags: ['sales', 'products', 'dashboard'],
    }),
  }),
});

export const { useGetSalesQuery, useCreateSaleMutation } = salesApi;
