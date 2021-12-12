import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { Promo } from './promo';
import { Tag } from './tag';

export type Store = {
  id: string;
  subcategory_id: string;
  name_en: string;
  name_he: string;
  short_description_en: string;
  short_description_he: string;
  description_en: string;
  description_he: string;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
  },
  tags: Tag[];
  promos: Promo[];
  logo_url: string;
  image_urls: string[];
};

const storeApi = createApi({
  reducerPath: 'store',
  baseQuery: fetchBaseQuery({
    baseUrl: '/stores',
    prepareHeaders: (headers, { getState }) => {
      const { token } = (getState() as RootState).auth;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['Store'],
  endpoints: (builder) => ({
    getStoreById: builder.query<Store, string>({ query: (id) => `/${id}` }),
    getStores: builder.query<Store[], void>({ query: () => '' }),
    addStore: builder.mutation<Store, Store>({
      query: (store) => ({
        url: '',
        method: 'POST',
        body: store,
      }),
      invalidatesTags: ['Store'],
    }),
    updateStore: builder.mutation<Store, Store>({
      query: (store) => ({
        url: `/${store.id}`,
        method: 'PATCH',
        body: store,
      }),
      invalidatesTags: ['Store'],
    }),
    deleteStore: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Store'],
    }),
  }),
});

export const {
  useAddStoreMutation, useUpdateStoreMutation, useDeleteStoreMutation, useGetStoresQuery, useGetStoreByIdQuery,
} = storeApi;

export default storeApi;
