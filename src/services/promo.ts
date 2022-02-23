import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { ADMIN_PREFIX } from '../lib/constants';

export type Promo = {
  id: string;
  store_id: string;
  start_date: string;
  end_date: string;
  title_en: string;
  title_he: string;
  description_en: string;
  description_he: string;
  image_url: string;
  is_ad: boolean;
};

export const promoType = {
  id: 'string',
  store_id: 'string',
  start_date: 'string',
  end_date: 'string',
  title_en: 'string',
  title_he: 'string',
  description_en: 'string',
  description_he: 'string',
  image_url: 'string',
  is_ad: 'boolean',
};

const promoApi = createApi({
  reducerPath: 'promo',
  baseQuery: fetchBaseQuery({
    baseUrl: `${ADMIN_PREFIX}/promos`,
    prepareHeaders: (headers, { getState }) => {
      const { token } = (getState() as RootState).auth;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['Promo'],
  endpoints: (builder) => ({
    getPromoById: builder.query<Promo, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Promo', id }],
    }),
    getPromos: builder.query<Promo[], void>({
      query: () => '',
      providesTags: (result) => (result
        ? [
          ...result.map(({ id }) => ({ type: 'Promo', id } as const)),
          { type: 'Promo', id: 'LIST' },
        ]
        : [{ type: 'Promo', id: 'LIST' }]),
    }),
    addPromo: builder.mutation<Promo, Promo>({
      query: (promo) => ({
        url: '',
        method: 'POST',
        body: promo,
      }),
      invalidatesTags: [{ type: 'Promo', id: 'LIST' }],
    }),
    updatePromo: builder.mutation<Promo, Promo>({
      query: (promo) => ({
        url: `/${promo.id}`,
        method: 'PATCH',
        body: promo,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Promo', id }],
    }),
    deletePromo: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Promo', id }],
    }),
  }),
});

export const {
  useAddPromoMutation, useUpdatePromoMutation, useDeletePromoMutation, useGetPromosQuery, useGetPromoByIdQuery,
} = promoApi;

export default promoApi;
