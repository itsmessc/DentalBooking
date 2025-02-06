import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // Make sure this path is correct
import bookingReducer from "./bookingSlice"; // Make sure this path is correct
const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
  },
});

export default store;
