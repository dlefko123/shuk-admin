import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Category = {
  id: string;
  name_en: string;
  name_he: string;
  subcategories: Category[];
  category_id?: string;
}

export interface CategoryState {
  categories: Category[];
};

const initialState: CategoryState = {
  categories: [],
};

export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(category => category.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      const index = state.categories.findIndex(category => category.id === action.payload);
      if (index !== -1) {
        state.categories.splice(index, 1);
      }
    },
  }
});

export const { setCategories, addCategory, updateCategory, deleteCategory } = categorySlice.actions;

export default categorySlice.reducer;