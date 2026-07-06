import { baseApi } from '../../api/baseApi';
import { type User } from '../../../types/user';

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface GetMeResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ user: User; token: string }, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: LoginResponse) => response.data,
    }),
    getMe: builder.query<User, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      transformResponse: (response: GetMeResponse) => response.data,
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
