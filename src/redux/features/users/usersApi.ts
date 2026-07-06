import { baseApi } from '../../api/baseApi';
import { type User } from '../../../types/user';

export interface UsersQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    total: number;
    page: number;
    pages: number;
  };
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<
      {
        users: User[];
        meta: { page: number; limit: number; total: number; totalPage: number };
      },
      UsersQueryParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {};
        if (params) {
          if (params.search) queryParams.searchTerm = params.search;
          if (params.page) queryParams.page = params.page;
          if (params.limit) queryParams.limit = params.limit;
        }
        return {
          url: '/auth/users',
          method: 'GET',
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ _id }) => ({ type: 'User' as const, id: _id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
      transformResponse: (response: UsersResponse) => {
        const { users, total, page, pages } = response.data;
        return {
          users,
          meta: {
            page: page ?? 1,
            limit: 10,
            total: total ?? 0,
            totalPage: pages ?? 1,
          },
        };
      },
    }),
    createUser: builder.mutation<User, Partial<User> & { password?: string }>({
      query: (userData) => ({
        url: '/auth/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
      transformResponse: (response: UserResponse) => response.data,
    }),
    updateUser: builder.mutation<
      User,
      { id: string; userData: Partial<User>; queryParams?: UsersQueryParams }
    >({
      query: ({ id, userData }) => ({
        url: `/auth/users/${id}`,
        method: 'PATCH',
        body: userData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
      transformResponse: (response: UserResponse) => response.data,
      async onQueryStarted({ id, userData, queryParams }, { dispatch, queryFulfilled }) {
        if (!queryParams) return;
        const patchResult = dispatch(
          usersApi.util.updateQueryData('getUsers', queryParams, (draft) => {
            const user = draft.users.find((u) => u._id === id);
            if (user) {
              Object.assign(user, userData);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteUser: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/auth/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
export default usersApi;
