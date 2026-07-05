import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Employee';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

let parsedUser = null;
try {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    parsedUser = JSON.parse(savedUser);
  }
} catch (error) {
  console.error('Failed to parse user from localStorage:', error);
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
}

const initialState: AuthState = {
  user: parsedUser,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User | null; accessToken: string }>
    ) => {
      const { user, accessToken } = action.payload;
      if (user) {
        state.user = user;
        localStorage.setItem('user', JSON.stringify(user));
      }
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', accessToken);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
export type { AuthState };
