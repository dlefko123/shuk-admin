import { useDeleteCategoryMutation, useGetCategoriesQuery, useUpdateCategoryMutation } from '../services/category';
import { useDeleteSubcategoryMutation, useGetSubcategoriesQuery, useUpdateSubategoryMutation } from '../services/subcategory';
import { useGetTagsQuery, useDeleteTagMutation, useUpdateTagMutation } from '../services/tag';
import { useGetTagGroupsQuery, useDeleteTagGroupMutation, useUpdateTagGroupMutation } from '../services/tagGroup';
import { useGetPromosQuery, useDeletePromoMutation, useUpdatePromoMutation } from '../services/promo';
import { useGetStoresQuery, useDeleteStoreMutation, useUpdateStoreMutation } from '../services/store';

export const models = [
  {
    name: 'Category', value: 'categories', useGetAll: useGetCategoriesQuery, useDeleteById: useDeleteCategoryMutation, useUpdate: useUpdateCategoryMutation,
  },
  {
    name: 'Subcategory', value: 'subcategories', useGetAll: useGetSubcategoriesQuery, useDeleteById: useDeleteSubcategoryMutation, useUpdate: useUpdateSubategoryMutation,
  },
  {
    name: 'Tag', value: 'tags', useGetAll: useGetTagsQuery, useDeleteById: useDeleteTagMutation, useUpdate: useUpdateTagMutation,
  },
  {
    name: 'Tag Group', value: 'tag_group', useGetAll: useGetTagGroupsQuery, useDeleteById: useDeleteTagGroupMutation, useUpdate: useUpdateTagGroupMutation,
  },
  {
    name: 'Promo', value: 'promos', useGetAll: useGetPromosQuery, useDeleteById: useDeletePromoMutation, useUpdate: useUpdatePromoMutation,
  },
  {
    name: 'Store', value: 'stores', useGetAll: useGetStoresQuery, useDeleteById: useDeleteStoreMutation, useUpdate: useUpdateStoreMutation,
  },
];
export type Model = typeof models[number];
