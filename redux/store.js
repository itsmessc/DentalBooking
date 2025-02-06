import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; 
import bookingReducer from "./bookingSlice"; 
import locationReducer from "./locationSlice"; 
const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    location: locationReducer,
  },
});

export default store;
