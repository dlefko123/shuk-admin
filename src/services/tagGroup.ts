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
    getTagGroupById: builder.query<TagGroup, string>({ query: (id) => `/${id}` }),
    getTagGroups: builder.query<TagGroup[], void>({ query: () => '' }),
    addTagGroup: builder.mutation<TagGroup, TagGroup>({
      query: (group) => ({
        url: '',
        method: 'POST',
        body: group,
      }),
      invalidatesTags: ['Tag Group'],
    }),
    updateTagGroup: builder.mutation<TagGroup, TagGroup>({
      query: (group) => ({
        url: `/${group.id}`,
        method: 'PATCH',
        body: group,
      }),
      invalidatesTags: ['Tag Group'],
    }),
    deleteTagGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tag Group'],
    }),
  }),
});

export const {
  useAddTagGroupMutation, useUpdateTagGroupMutation, useDeleteTagGroupMutation, useGetTagGroupsQuery, useGetTagGroupByIdQuery,
} = tagGroupApi;

export default tagGroupApi;
