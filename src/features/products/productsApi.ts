import { baseApi } from '../../redux/api/baseApi';
import { type Product } from '../../types/product';

export interface ProductsQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<
      {
        products: Product[];
        meta: { page: number; limit: number; total: number; totalPage: number };
      },
      ProductsQueryParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.set('search', params.search);
        if (params?.page) queryParams.set('page', String(params.page));
        if (params?.limit) queryParams.set('limit', String(params.limit));
        return {
          url: `/products?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
      transformResponse: (response: ProductsResponse) => ({
        products: response.data,
        meta: response.meta ?? { page: 1, limit: 10, total: 0, totalPage: 1 },
      }),
    }),
    createProduct: builder.mutation<Product, FormData>({
      query: (formData) => ({
        url: '/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Dashboard'],
      transformResponse: (response: ProductResponse) => response.data,
    }),
    updateProduct: builder.mutation<Product, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        'Dashboard',
      ],
      transformResponse: (response: ProductResponse) => response.data,
    }),
    deleteProduct: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Dashboard'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
export default productsApi;
