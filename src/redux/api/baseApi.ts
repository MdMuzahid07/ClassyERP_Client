import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout, setCredentials } from '../features/auth/authSlice';
import { RootState } from '../store';

const url = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : 'http://localhost:5000/api/v1';

const baseQuery = fetchBaseQuery({
  baseUrl: url,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const fromStore = (getState() as RootState).auth.accessToken;
    const fromStorage =
      typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null;
    const token = fromStore || fromStorage;

    if (token) {
      headers.set('authorization', `${token}`);
    }

    return headers;
  },
});

/**
 * Custom base query that transparently refreshes the access token on 401
 * responses using the /auth/refresh endpoint, then retries the original request.
 */
const baseQueryWithRefreshToken: BaseQueryFn<
  FetchArgs | string,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401 && url) {
    const refreshResponse = await fetch(`${url}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      const data = (await refreshResponse.json()) as {
        data?: { accessToken?: string };
      };

      if (data?.data?.accessToken) {
        const user = (api.getState() as RootState).auth.user;

        api.dispatch(
          setCredentials({
            user,
            accessToken: data.data.accessToken,
          })
        );

        // Retry the original request with the new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const tagTypes = {
  products: 'products',
  sales: 'sales',
  dashboard: 'dashboard',
  users: 'users',
  customers: 'customers',
} as const;

export type TagType = (typeof tagTypes)[keyof typeof tagTypes];

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: Object.values(tagTypes),
  endpoints: () => ({}),
});
