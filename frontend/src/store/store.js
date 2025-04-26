import { configureStore } from '@reduxjs/toolkit';
import aislesReducer from './aislesSlice';

export const store = configureStore({
  reducer: {
    aisles: aislesReducer,
  },
});
