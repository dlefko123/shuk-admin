import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Category } from './category';
import { RootState } from '../store';

const subcategoryApi = createApi({
  reducerPath: 'subcategory',
  baseQuery: fetchBaseQuery({
    baseUrl: '/subcategories',
    prepareHeaders: (headers, { getState }) => {
      const { token } = (getState() as RootState).auth;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['Subcategory'],
  endpoints: (builder) => ({
    getSubcategory: builder.query<Category, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Subcategory', id }],
    }),
    getSubcategories: builder.query<Category[], void>({
      query: () => '',
      providesTags: (result) => (result
        ? [
          ...result.map(({ id }) => ({ type: 'Subcategory', id } as const)),
          { type: 'Subcategory', id: 'LIST' },
        ]
        : [{ type: 'Subcategory', id: 'LIST' }]),
    }),
    addSubcategory: builder.mutation<Category, Category>({
      query: (subcategory) => ({
        url: '',
        method: 'POST',
        body: subcategory,
      }),
      invalidatesTags: [{ type: 'Subcategory', id: 'LIST' }],
    }),
    updateSubcategory: builder.mutation<Category, Category>({
      query: (subcategory) => ({
        url: `/${subcategory.id}`,
        method: 'PATCH',
        body: subcategory,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Subcategory', id }],
    }),
    deleteSubcategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Subcategory', id }],
    }),
  }),
});

export const {
  useAddSubcategoryMutation, useDeleteSubcategoryMutation, useGetSubcategoriesQuery, useGetSubcategoryQuery, useUpdateSubcategoryMutation,
} = subcategoryApi;

export default subcategoryApi;
