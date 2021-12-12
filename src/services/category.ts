import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../lib/constants';

export type Category = {
  id: string;
  name_en: string;
  name_he: string;
  subcategories: Category[];
  category_id?: string;
}

export interface CategoryState {
  categories: Category[];
};

const categoryApi = createApi({
  reducerPath: 'category',
  baseQuery: fetchBaseQuery({baseUrl: `${API_URL}/categories`}),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategoryById: builder.query<Category, string>({ query: (id) => `/${id}` }),
    getCategories: builder.query<Category[], void>({ query: () => '/' }),
    addCategory: builder.mutation<Category, Category>({
      query: (category) => ({
        url: '/',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<Category, Category>({
      query: (category) => ({
        url: `/${category.id}`,
        method: 'PATCH',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  })
});

export const { useAddCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation, useGetCategoriesQuery, useGetCategoryByIdQuery } = categoryApi;

export default categoryApi;