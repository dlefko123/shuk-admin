/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { ADMIN_PREFIX, LOCAL_STORAGE_TOKEN_KEY } from '../lib/constants';

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
};

export const checkIsTokenValid = createAsyncThunk(
  'auth/checkIsTokenValid',
  async (_, thunkAPI) => {
    const { token } = (thunkAPI.getState() as RootState).auth;
    const response = await fetch(`/${ADMIN_PREFIX}/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      return false;
    }
    return true;
  },
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, action.payload as string);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkIsTokenValid.fulfilled, (state, action) => {
      state.isAuthenticated = action.payload;
    });
  },
});

export const { setIsAuthenticated, setToken } = authSlice.actions;

export default authSlice.reducer;
