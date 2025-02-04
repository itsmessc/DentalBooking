import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // Make sure this path is correct

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
