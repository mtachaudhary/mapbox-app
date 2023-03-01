import { configureStore } from '@reduxjs/toolkit';
import mapSlice from '@/redux/slice/mapSlice';

const store = configureStore({
  reducer: {
    mapStore: mapSlice.reducer
  }
});

export type AppDispatch = typeof store.dispatch;
export default store;