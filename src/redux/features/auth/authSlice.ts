import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type User } from '../../../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

let parsedUser: User | null = null;
try {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    parsedUser = JSON.parse(savedUser) as User;
  }
} catch (error) {
  console.error('Failed to parse user from localStorage:', error);
  localStorage.removeItem('user');
  localStorage.removeItem('erp_token');
}

const initialState: AuthState = {
  user: parsedUser,
  token: localStorage.getItem('erp_token') ?? null,
  isAuthenticated: !!localStorage.getItem('erp_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('erp_token', token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('erp_token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
export type { AuthState };
