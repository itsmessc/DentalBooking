import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as Location from "expo-location";
import Constants from "expo-constants";

// API Base URL
const API_URL = Constants.expoConfig.extra.API_URL;

//  Haversine Formula for Distance Calculation
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const toRad = (angle) => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const fetchDentalOffices = createAsyncThunk(
  "location/fetchDentalOffices",
  async (_, { rejectWithValue }) => {
    try {
      // Get User Location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return rejectWithValue("Location permission denied");
      }
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse Geocode to get Postal Code
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });

      // Fetch Dental Offices
      const response = await fetch(`${API_URL}/dental-offices`);
      let data = await response.json();

      // Calculate Distance & Sort by Proximity
      data = data
        .map((office) => ({
          ...office,
          distance: getDistance(latitude, longitude, office.location.lat, office.location.lng),
        }))
        .sort((a, b) => a.distance - b.distance);

      return { dentalOffices: data, userLocation: { latitude, longitude }, postalCode: address.postalCode };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState: {
    dentalOffices: [],
    loading: false,
    error: null,
    userLocation: null,
    postalCode: "",
  },
  reducers: {
    filterOffices: (state, action) => {
      const searchQuery = action.payload.toLowerCase();
      state.dentalOffices = state.dentalOffices.filter(
        (office) =>
          office.name.toLowerCase().includes(searchQuery) ||
          office.address.toLowerCase().includes(searchQuery) ||
          office.city.toLowerCase().includes(searchQuery) ||
          office.zip.includes(searchQuery)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDentalOffices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDentalOffices.fulfilled, (state, action) => {
        state.loading = false;
        state.dentalOffices = action.payload.dentalOffices;
        state.userLocation = action.payload.userLocation;
        state.postalCode = action.payload.postalCode;
      })
      .addCase(fetchDentalOffices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { filterOffices } = locationSlice.actions;
export default locationSlice.reducer;
