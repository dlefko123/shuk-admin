import { useDeleteCategoryMutation, useGetCategoriesQuery } from '../services/category';
import { useDeleteSubcategoryMutation, useGetSubcategoriesQuery } from '../services/subcategory';
import { useGetTagsQuery, useDeleteTagMutation } from '../services/tag';
import { useGetTagGroupsQuery, useDeleteTagGroupMutation } from '../services/tagGroup';
import { useGetPromosQuery, useDeletePromoMutation } from '../services/promo';
import { useGetStoresQuery, useDeleteStoreMutation } from '../services/store';

export const models = [
  {
    name: 'Category', value: 'categories', useGetAll: useGetCategoriesQuery, useDeleteById: useDeleteCategoryMutation,
  },
  {
    name: 'Subcategory', value: 'subcategories', useGetAll: useGetSubcategoriesQuery, useDeleteById: useDeleteSubcategoryMutation,
  },
  {
    name: 'Tag', value: 'tags', useGetAll: useGetTagsQuery, useDeleteById: useDeleteTagMutation,
  },
  {
    name: 'Tag Group', value: 'tag_group', useGetAll: useGetTagGroupsQuery, useDeleteById: useDeleteTagGroupMutation,
  },
  {
    name: 'Promo', value: 'promos', useGetAll: useGetPromosQuery, useDeleteById: useDeletePromoMutation,
  },
  {
    name: 'Store', value: 'stores', useGetAll: useGetStoresQuery, useDeleteById: useDeleteStoreMutation,
  },
];
export type Model = typeof models[number];
