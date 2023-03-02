import { createSlice } from '@reduxjs/toolkit';

// create a slice
const mapSlice = createSlice({
  name: 'map_type',
  initialState: {
    mapType: 'geojson'
  },
  reducers: {
    saveMapType: (state, action) => {
      state.mapType = action.payload;
    }
  }
});

export const { saveMapType } = mapSlice.actions;
export default mapSlice;