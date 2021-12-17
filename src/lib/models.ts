import categoryApi, {
  useDeleteCategoryMutation, useGetCategoriesQuery, useUpdateCategoryMutation, categoryType, useAddCategoryMutation, subcategoryType,
} from '../services/category';
import subcategoryApi, {
  useDeleteSubcategoryMutation, useGetSubcategoriesQuery, useUpdateSubcategoryMutation, useAddSubcategoryMutation,
} from '../services/subcategory';
import tagApi, {
  useGetTagsQuery, useDeleteTagMutation, useUpdateTagMutation, tagType, useAddTagMutation,
} from '../services/tag';
import tagGroupApi, {
  useGetTagGroupsQuery, useDeleteTagGroupMutation, useUpdateTagGroupMutation, tagGroupType, useAddTagGroupMutation,
} from '../services/tagGroup';
import promoApi, {
  useGetPromosQuery, useDeletePromoMutation, useUpdatePromoMutation, promoType, useAddPromoMutation,
} from '../services/promo';
import storeApi, {
  useGetStoresQuery, useDeleteStoreMutation, useUpdateStoreMutation, storeType, useAddStoreMutation,
} from '../services/store';

export const models = [
  {
    name: 'Category',
    value: 'categories',
    useGetAll: useGetCategoriesQuery,
    useDeleteById: useDeleteCategoryMutation,
    useUpdate: useUpdateCategoryMutation,
    type: categoryType,
    useAddOne: useAddCategoryMutation,
    getAll: categoryApi.endpoints.getCategories,
  },
  {
    name: 'Subcategory',
    value: 'subcategories',
    useGetAll: useGetSubcategoriesQuery,
    useDeleteById: useDeleteSubcategoryMutation,
    useUpdate: useUpdateSubcategoryMutation,
    type: subcategoryType,
    useAddOne: useAddSubcategoryMutation,
    getAll: subcategoryApi.endpoints.getSubcategories,
  },
  {
    name: 'Tag',
    value: 'tags',
    useGetAll: useGetTagsQuery,
    useDeleteById: useDeleteTagMutation,
    useUpdate: useUpdateTagMutation,
    type: tagType,
    useAddOne: useAddTagMutation,
    getAll: tagApi.endpoints.getTags,
  },
  {
    name: 'Tag Group',
    value: 'tag_group',
    useGetAll: useGetTagGroupsQuery,
    useDeleteById: useDeleteTagGroupMutation,
    useUpdate: useUpdateTagGroupMutation,
    type: tagGroupType,
    useAddOne: useAddTagGroupMutation,
    getAll: tagGroupApi.endpoints.getTagGroups,
  },
  {
    name: 'Promo',
    value: 'promos',
    useGetAll: useGetPromosQuery,
    useDeleteById: useDeletePromoMutation,
    useUpdate: useUpdatePromoMutation,
    type: promoType,
    useAddOne: useAddPromoMutation,
    getAll: promoApi.endpoints.getPromos,
  },
  {
    name: 'Store',
    value: 'stores',
    useGetAll: useGetStoresQuery,
    useDeleteById: useDeleteStoreMutation,
    useUpdate: useUpdateStoreMutation,
    type: storeType,
    useAddOne: useAddStoreMutation,
    getAll: storeApi.endpoints.getStores,
  },
];
export type Model = typeof models[number];
