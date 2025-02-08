import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; 
import bookingReducer from "./bookingSlice"; 
import locationReducer from "./locationSlice"; 
import  rescheduleReducer  from "./rescheduleSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    location: locationReducer,
    reschedule:rescheduleReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
