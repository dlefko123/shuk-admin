import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import categoryApi from './services/category';
import { authReducer } from './features';

const store = configureStore({
  reducer: {
    [categoryApi.reducerPath]: categoryApi.reducer,
    auth: authReducer
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector