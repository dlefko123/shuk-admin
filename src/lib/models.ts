import { useGetCategoriesQuery } from '../services/category';
import { useGetSubcategoriesQuery } from '../services/subcategory';
import { useGetTagsQuery } from '../services/tag';
import { useGetTagGroupsQuery } from '../services/tagGroup';
import { useGetPromosQuery } from '../services/promo';
import { useGetStoresQuery } from '../services/store';

export const models = [
  { name: 'Category', value: 'categories', getAll: useGetCategoriesQuery },
  { name: 'Subcategory', value: 'subcategories', getAll: useGetSubcategoriesQuery },
  { name: 'Tag', value: 'tags', getAll: useGetTagsQuery },
  { name: 'Tag Group', value: 'tag_group', getAll: useGetTagGroupsQuery },
  { name: 'Promo', value: 'promos', getAll: useGetPromosQuery },
  { name: 'Store', value: 'stores', getAll: useGetStoresQuery },
];
export type Model = typeof models[number];
