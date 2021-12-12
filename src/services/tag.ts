import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Tag = {
  id: string;
  tag_group_id: string;
  name_en: string;
  name_he: string;
}

export interface TagState {
  tags: Tag[];
};

const tagApi = createApi({
  reducerPath: 'tag',
  baseQuery: fetchBaseQuery({baseUrl: `/tags`}),
  tagTypes: ['Tag'],
  endpoints: (builder) => ({
    getTagById: builder.query<Tag, string>({ query: (id) => `/${id}` }),
    getTags: builder.query<Tag[], void>({ query: () => '' }),
    addTag: builder.mutation<Tag, Tag>({
      query: (tag) => ({
        url: '',
        method: 'POST',
        body: tag,
      }),
      invalidatesTags: ['Tag'],
    }),
    updateTag: builder.mutation<Tag, Tag>({
      query: (tag) => ({
        url: `/${tag.id}`,
        method: 'PATCH',
        body: tag,
      }),
      invalidatesTags: ['Tag'],
    }),
    deleteTag: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tag'],
    }),
  })
});

export const { useAddTagMutation, useUpdateTagMutation, useDeleteTagMutation, useGetTagsQuery, useGetTagByIdQuery } = tagApi;

export default tagApi;