import { baseApi } from '../../api/baseApi';

export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  productImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    total: number;
    page: number;
    pages: number;
  };
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, ProductsQueryParams>({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['products'],
    }),
    getProductById: builder.query<{ success: boolean; data: Product }, string>({
      query: (id) => `/products/${id}`,
    }),
    createProduct: builder.mutation<{ success: boolean; data: Product }, FormData>({
      query: (formData) => ({
        url: '/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['products', 'dashboard'],
    }),
    updateProduct: builder.mutation<{ success: boolean; data: Product }, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['products', 'dashboard'],
    }),
    deleteProduct: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['products', 'dashboard'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
