import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
};

export const checkIsTokenValid = createAsyncThunk(
  `auth/checkIsTokenValid`,
  async (_, thunkAPI) => {
    const token = (thunkAPI.getState() as RootState).auth.token;
    const response = await fetch(`/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    console.log(response);
    if (response.status === 401) {
      return false;
    } else {
      return true;
    }
  }
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
    }
  },
  extraReducers: (builder) => {
    builder.addCase(checkIsTokenValid.fulfilled, (state, action) => {
      state.isAuthenticated = action.payload;
    });
  }
});

export const { setIsAuthenticated, setToken } = authSlice.actions;

export default authSlice.reducer;