export const API_URL = 'https://api.shukapp.com/5aef1e692';
export const models = [
  { name: 'Category', value: 'categories' },
  { name: 'Subcategory', value: 'subcategories' },
  { name: 'Tag', value: 'tags' },
  { name: 'Tag Group', value: 'tag_group' },
  { name: 'Promo', value: 'promos' },
  { name: 'Store', value: 'stores' }
];
export type Model = typeof models[number];