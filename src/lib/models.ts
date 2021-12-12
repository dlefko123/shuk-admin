
import { useGetCategoriesQuery } from "../services/category";

const defaultHook = () => { return { data: null, isLoading: false }; };

export const models = [
  { name: 'Category', value: 'categories', getAll: useGetCategoriesQuery },
  { name: 'Subcategory', value: 'subcategories', getAll: defaultHook },
  { name: 'Tag', value: 'tags', getAll: defaultHook },
  { name: 'Tag Group', value: 'tag_group', getAll: defaultHook },
  { name: 'Promo', value: 'promos', getAll: defaultHook },
  { name: 'Store', value: 'stores', getAll: defaultHook },
];
export type Model = typeof models[number];