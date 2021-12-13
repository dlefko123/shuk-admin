import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export type Tag = {
  id: string;
  tag_group_id: string;
  name_en: string;
  name_he: string;
};

export const tagType = {
  id: 'string',
  tag_group_id: 'string',
  name_en: 'string',
  name_he: 'string',
};

const tagApi = createApi({
  reducerPath: 'tag',
  baseQuery: fetchBaseQuery({
    baseUrl: '/tags',
    prepareHeaders: (headers, { getState }) => {
      const { token } = (getState() as RootState).auth;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['Tag'],
  endpoints: (builder) => ({
    getTagById: builder.query<Tag, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tag', id }],
    }),
    getTags: builder.query<Tag[], void>({
      query: () => '',
      providesTags: (result) => (result
        ? [
          ...result.map(({ id }) => ({ type: 'Tag', id } as const)),
          { type: 'Tag', id: 'LIST' },
        ]
        : [{ type: 'Tag', id: 'LIST' }]),
    }),
    addTag: builder.mutation<Tag, Tag>({
      query: (tag) => ({
        url: '',
        method: 'POST',
        body: tag,
      }),
      invalidatesTags: [{ type: 'Tag', id: 'LIST' }],
    }),
    updateTag: builder.mutation<Tag, Tag>({
      query: (tag) => ({
        url: `/${tag.id}`,
        method: 'PATCH',
        body: tag,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tag', id }],
    }),
    deleteTag: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Tag', id }],
    }),
  }),
});

export const {
  useAddTagMutation, useUpdateTagMutation, useDeleteTagMutation, useGetTagsQuery, useGetTagByIdQuery,
} = tagApi;

export default tagApi;
