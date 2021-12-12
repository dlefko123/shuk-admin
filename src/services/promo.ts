import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Promo = {
  id: string;
  store_id: string;
  start_date: string;
  end_date: string;
  description_en: string;
  description_he: string;
  image_url: string;
  is_ad: boolean;
};

const promoApi = createApi({
  reducerPath: 'promo',
  baseQuery: fetchBaseQuery({ baseUrl: '/promos' }),
  tagTypes: ['Promo'],
  endpoints: (builder) => ({
    getPromoById: builder.query<Promo, string>({ query: (id) => `/${id}` }),
    getPromos: builder.query<Promo[], void>({ query: () => '' }),
    addPromo: builder.mutation<Promo, Promo>({
      query: (promo) => ({
        url: '',
        method: 'POST',
        body: promo,
      }),
      invalidatesTags: ['Promo'],
    }),
    updatePromo: builder.mutation<Promo, Promo>({
      query: (promo) => ({
        url: `/${promo.id}`,
        method: 'PATCH',
        body: promo,
      }),
      invalidatesTags: ['Promo'],
    }),
    deletePromo: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Promo'],
    }),
  }),
});

export const {
  useAddPromoMutation, useUpdatePromoMutation, useDeletePromoMutation, useGetPromosQuery, useGetPromoByIdQuery,
} = promoApi;

export default promoApi;
