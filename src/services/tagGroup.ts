import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { Tag } from './tag';

export type TagGroup = {
  id: string;
  tags: Tag[];
  name_en: string;
  name_he: string;
};

const tagGroupApi = createApi({
  reducerPath: 'tagGroup',
  baseQuery: fetchBaseQuery({
    baseUrl: '/tag-groups',
    prepareHeaders: (headers, { getState }) => {
      const { token } = (getState() as RootState).auth;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['Tag Group'],
  endpoints: (builder) => ({
    getTagGroupById: builder.query<TagGroup, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tag Group', id }],

    }),
    getTagGroups: builder.query<TagGroup[], void>({
      query: () => '',
      providesTags: (result) => (result
        ? [
          ...result.map(({ id }) => ({ type: 'Tag Group', id } as const)),
          { type: 'Tag Group', id: 'LIST' },
        ]
        : [{ type: 'Tag Group', id: 'LIST' }]),
    }),
    addTagGroup: builder.mutation<TagGroup, TagGroup>({
      query: (group) => ({
        url: '',
        method: 'POST',
        body: group,
      }),
      invalidatesTags: [{ type: 'Tag Group', id: 'LIST' }],
    }),
    updateTagGroup: builder.mutation<TagGroup, TagGroup>({
      query: (group) => ({
        url: `/${group.id}`,
        method: 'PATCH',
        body: group,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tag Group', id }],
    }),
    deleteTagGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Tag Group', id }],
    }),
  }),
});

export const {
  useAddTagGroupMutation, useUpdateTagGroupMutation, useDeleteTagGroupMutation, useGetTagGroupsQuery, useGetTagGroupByIdQuery,
} = tagGroupApi;

export default tagGroupApi;
