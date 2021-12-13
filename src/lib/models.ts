import {
  useDeleteCategoryMutation, useGetCategoriesQuery, useUpdateCategoryMutation, categoryType,
} from '../services/category';
import { useDeleteSubcategoryMutation, useGetSubcategoriesQuery, useUpdateSubategoryMutation } from '../services/subcategory';
import {
  useGetTagsQuery, useDeleteTagMutation, useUpdateTagMutation, tagType,
} from '../services/tag';
import {
  useGetTagGroupsQuery, useDeleteTagGroupMutation, useUpdateTagGroupMutation, tagGroupType,
} from '../services/tagGroup';
import {
  useGetPromosQuery, useDeletePromoMutation, useUpdatePromoMutation, promoType,
} from '../services/promo';
import {
  useGetStoresQuery, useDeleteStoreMutation, useUpdateStoreMutation, storeType,
} from '../services/store';

export const models = [
  {
    name: 'Category', value: 'categories', useGetAll: useGetCategoriesQuery, useDeleteById: useDeleteCategoryMutation, useUpdate: useUpdateCategoryMutation, type: categoryType,
  },
  {
    name: 'Subcategory', value: 'subcategories', useGetAll: useGetSubcategoriesQuery, useDeleteById: useDeleteSubcategoryMutation, useUpdate: useUpdateSubategoryMutation, type: categoryType,
  },
  {
    name: 'Tag', value: 'tags', useGetAll: useGetTagsQuery, useDeleteById: useDeleteTagMutation, useUpdate: useUpdateTagMutation, type: tagType,
  },
  {
    name: 'Tag Group', value: 'tag_group', useGetAll: useGetTagGroupsQuery, useDeleteById: useDeleteTagGroupMutation, useUpdate: useUpdateTagGroupMutation, type: tagGroupType,
  },
  {
    name: 'Promo', value: 'promos', useGetAll: useGetPromosQuery, useDeleteById: useDeletePromoMutation, useUpdate: useUpdatePromoMutation, type: promoType,
  },
  {
    name: 'Store', value: 'stores', useGetAll: useGetStoresQuery, useDeleteById: useDeleteStoreMutation, useUpdate: useUpdateStoreMutation, type: storeType,
  },
];
export type Model = typeof models[number];
