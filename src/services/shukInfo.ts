import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { ADMIN_PREFIX } from '../lib/constants';

export type ShukInfo = {
  description_en: string;
  description_he: string;
};

const shukInfoApi = createApi({
  reducerPath: 'shukInfo',
  baseQuery: fetchBaseQuery({
    baseUrl: `/${ADMIN_PREFIX}/shuk-info`,
    prepareHeaders: (headers, { getState }) => {
      const { token } = (getState() as RootState).auth;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['ShukInfo'],
  endpoints: (builder) => ({
    getShukInfo: builder.query<ShukInfo, void>({
      query: () => '',
      providesTags: ['ShukInfo'],
    }),
    updateShukInfo: builder.mutation<ShukInfo, ShukInfo>({
      query: (shukInfo) => ({
        url: '',
        method: 'POST',
        body: shukInfo,
      }),
      invalidatesTags: ['ShukInfo'],
    }),
  }),
});

export const { useGetShukInfoQuery, useUpdateShukInfoMutation } = shukInfoApi;

export default shukInfoApi;
