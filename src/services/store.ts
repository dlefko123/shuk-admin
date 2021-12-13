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

export const storeType = {
  id: 'string',
  subcategory_id: 'string',
  name_en: 'string',
  name_he: 'string',
  short_description_en: 'string',
  short_description_he: 'string',
  description_en: 'string',
  description_he: 'string',
  phone: 'string',
  location: 'object',
  tags: 'array',
  promos: 'array',
  logo_url: 'string',
  image_urls: 'array',
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
    getStoreById: builder.query<Store, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Store', id }],
    }),
    getStores: builder.query<Store[], void>({
      query: () => '',
      providesTags: (result) => (result
        ? [
          ...result.map(({ id }) => ({ type: 'Store', id } as const)),
          { type: 'Store', id: 'LIST' },
        ]
        : [{ type: 'Store', id: 'LIST' }]),
    }),
    addStore: builder.mutation<Store, Store>({
      query: (store) => ({
        url: '',
        method: 'POST',
        body: store,
      }),
      invalidatesTags: [{ type: 'Store', id: 'LIST' }],
    }),
    updateStore: builder.mutation<Store, Store>({
      query: (store) => ({
        url: `/${store.id}`,
        method: 'PATCH',
        body: store,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Store', id }],
    }),
    deleteStore: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Store', id }],
    }),
  }),
});

export const {
  useAddStoreMutation, useUpdateStoreMutation, useDeleteStoreMutation, useGetStoresQuery, useGetStoreByIdQuery,
} = storeApi;

export default storeApi;
