import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // Stores authenticated user data
  token: null, // Stores auth token (if using JWT)
  isAuthenticated: false, // Tracks if user is logged in
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
