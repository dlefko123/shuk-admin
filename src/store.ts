import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import categoryApi from './services/category';
import subcategoryApi from './services/subcategory';
import tagApi from './services/tag';
import tagGroupApi from './services/tagGroup';
import promoApi from './services/promo';
import storeApi from './services/store';
import shukInfoApi from './services/shukInfo';

import { authReducer } from './features';

const store = configureStore({
  reducer: {
    [categoryApi.reducerPath]: categoryApi.reducer,
    [subcategoryApi.reducerPath]: subcategoryApi.reducer,
    [tagApi.reducerPath]: tagApi.reducer,
    [tagGroupApi.reducerPath]: tagGroupApi.reducer,
    [promoApi.reducerPath]: promoApi.reducer,
    [storeApi.reducerPath]: storeApi.reducer,
    [shukInfoApi.reducerPath]: shukInfoApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([categoryApi.middleware, subcategoryApi.middleware, tagApi.middleware, tagGroupApi.middleware, promoApi.middleware, storeApi.middleware, shukInfoApi.middleware]),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
