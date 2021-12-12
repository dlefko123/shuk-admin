import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import categoryApi from './services/category';
import subcategoryApi from './services/subcategory';

import { authReducer } from './features';

const store = configureStore({
  reducer: {
    [categoryApi.reducerPath]: categoryApi.reducer,
    [subcategoryApi.reducerPath]: subcategoryApi.reducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([categoryApi.middleware, subcategoryApi.middleware])
});

export default store;

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector