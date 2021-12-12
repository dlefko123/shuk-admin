
import { useGetCategoriesQuery } from "../services/category";
import { useGetSubcategoriesQuery } from "../services/subcategory";
import { useGetTagsQuery } from "../services/tag";

const defaultHook = () => { return { data: null, isLoading: false, error: false }; };

export const models = [
  { name: 'Category', value: 'categories', getAll: useGetCategoriesQuery },
  { name: 'Subcategory', value: 'subcategories', getAll: useGetSubcategoriesQuery },
  { name: 'Tag', value: 'tags', getAll: useGetTagsQuery },
  { name: 'Tag Group', value: 'tag_group', getAll: defaultHook },
  { name: 'Promo', value: 'promos', getAll: defaultHook },
  { name: 'Store', value: 'stores', getAll: defaultHook },
];
export type Model = typeof models[number];