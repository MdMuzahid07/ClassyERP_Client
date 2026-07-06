import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from '../../lib/apiBaseQuery';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: apiBaseQuery,
  tagTypes: ['Dashboard', 'Product', 'Sale', 'User'],
  endpoints: () => ({}),
});
