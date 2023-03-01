import { createSlice } from '@reduxjs/toolkit';

// create a slice
const mapSlice = createSlice({
  name: 'map_type',
  initialState: {
    mapType: 'geojson'
  },
  reducers: {
    setMapType: (state, action) => {
      state.mapType = action.payload;
    }
  }
});

export const { setMapType } = mapSlice.actions;
export default mapSlice;