import {
  useDeleteCategoryMutation, useGetCategoriesQuery, useUpdateCategoryMutation, categoryType, useAddCategoryMutation, subcategoryType,
} from '../services/category';
import {
  useDeleteSubcategoryMutation, useGetSubcategoriesQuery, useUpdateSubcategoryMutation, useAddSubcategoryMutation,
} from '../services/subcategory';
import {
  useGetTagsQuery, useDeleteTagMutation, useUpdateTagMutation, tagType, useAddTagMutation,
} from '../services/tag';
import {
  useGetTagGroupsQuery, useDeleteTagGroupMutation, useUpdateTagGroupMutation, tagGroupType, useAddTagGroupMutation,
} from '../services/tagGroup';
import {
  useGetPromosQuery, useDeletePromoMutation, useUpdatePromoMutation, promoType, useAddPromoMutation,
} from '../services/promo';
import {
  useGetStoresQuery, useDeleteStoreMutation, useUpdateStoreMutation, storeType, useAddStoreMutation,
} from '../services/store';

export const models = [
  {
    name: 'Category', value: 'categories', useGetAll: useGetCategoriesQuery, useDeleteById: useDeleteCategoryMutation, useUpdate: useUpdateCategoryMutation, type: categoryType, useAddOne: useAddCategoryMutation,
  },
  {
    name: 'Subcategory', value: 'subcategories', useGetAll: useGetSubcategoriesQuery, useDeleteById: useDeleteSubcategoryMutation, useUpdate: useUpdateSubcategoryMutation, type: subcategoryType, useAddOne: useAddSubcategoryMutation,
  },
  {
    name: 'Tag', value: 'tags', useGetAll: useGetTagsQuery, useDeleteById: useDeleteTagMutation, useUpdate: useUpdateTagMutation, type: tagType, useAddOne: useAddTagMutation,
  },
  {
    name: 'Tag Group', value: 'tag_group', useGetAll: useGetTagGroupsQuery, useDeleteById: useDeleteTagGroupMutation, useUpdate: useUpdateTagGroupMutation, type: tagGroupType, useAddOne: useAddTagGroupMutation,
  },
  {
    name: 'Promo', value: 'promos', useGetAll: useGetPromosQuery, useDeleteById: useDeletePromoMutation, useUpdate: useUpdatePromoMutation, type: promoType, useAddOne: useAddPromoMutation,
  },
  {
    name: 'Store', value: 'stores', useGetAll: useGetStoresQuery, useDeleteById: useDeleteStoreMutation, useUpdate: useUpdateStoreMutation, type: storeType, useAddOne: useAddStoreMutation,
  },
];
export type Model = typeof models[number];
