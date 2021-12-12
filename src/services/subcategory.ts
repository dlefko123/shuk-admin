import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Category } from './category';

export interface SubcategoryState {
  subcategories: Category[];
};

const subcategoryApi = createApi({
  reducerPath: 'subcategory',
  baseQuery: fetchBaseQuery({baseUrl: `/subcategories`}),
  tagTypes: ['Subcategory'],
  endpoints: (builder) => ({
    getSubcategory: builder.query<Category, string>({ query: (id) => `/${id}` }),
    getSubcategories: builder.query<Category[], void>({ query: () => '' }),
    addSubcategory: builder.mutation<Category, Category>({
      query: (subcategory) => ({
        url: '',
        method: 'POST',
        body: subcategory,
      }),
      invalidatesTags: ['Subcategory'],
    }),
    updateSubategory: builder.mutation<Category, Category>({
      query: (subcategory) => ({
        url: `/${subcategory.id}`,
        method: 'PATCH',
        body: subcategory,
      }),
      invalidatesTags: ['Subcategory'],
    }),
    deleteSubcategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subcategory'],
    }),
  })
});

export const { useAddSubcategoryMutation, useDeleteSubcategoryMutation, useGetSubcategoriesQuery, useGetSubcategoryQuery, useUpdateSubategoryMutation } = subcategoryApi;

export default subcategoryApi;