import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export type Category = {
  id: string;
  name_en: string;
  name_he: string;
  subcategories: Category[];
  category_id?: string;
};

export const categoryType = {
  id: 'string',
  name_en: 'string',
  name_he: 'string',
  subcategories: 'array',
  category_id: 'string',
};

const categoryApi = createApi({
  reducerPath: 'category',
  baseQuery: fetchBaseQuery({
    baseUrl: '/categories',
    prepareHeaders: (headers, { getState }) => {
      const { token } = (getState() as RootState).auth;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategoryById: builder.query<Category, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => '',
      providesTags: (result) => (result
        ? [
          ...result.map(({ id }) => ({ type: 'Category', id } as const)),
          { type: 'Category', id: 'LIST' },
        ]
        : [{ type: 'Category', id: 'LIST' }]),
    }),
    addCategory: builder.mutation<Category, Category>({
      query: (category) => ({
        url: '',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    updateCategory: builder.mutation<Category, Category>({
      query: (category) => ({
        url: `/${category.id}`,
        method: 'PATCH',
        body: category,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Category', id }],
    }),
  }),
});

export const {
  useAddCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation, useGetCategoriesQuery, useGetCategoryByIdQuery,
} = categoryApi;

export default categoryApi;
