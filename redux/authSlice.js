import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
// API Base URL
const API_URL = Constants.expoConfig.extra.API_URL; // Update with your backend URL

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Start API Call
    apiStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    // Login Success
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      console.log("User:", action.payload.user);
      console.log("Token:", action.payload.token);
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      AsyncStorage.setItem("user", JSON.stringify(state.user));
      AsyncStorage.setItem("token", state.token);
    },

    // API Call Failure
    apiFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Logout User
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      AsyncStorage.removeItem("user");
      AsyncStorage.removeItem("token");
    },
  },
});

export const { apiStart, loginSuccess, apiFail, logout } = authSlice.actions;
export default authSlice.reducer;

// **Async Login Action**
export const loginUser = (email, password, navigation) => async (dispatch) => {
    dispatch(apiStart());
    console.log("Attempting login...");
  
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      // Check if response is valid JSON
      const text = await response.text();
      console.log("Raw API Response:", text); // Debugging: Print raw response
  
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }
  
      // Parse JSON only if the response is valid JSON
      const data = JSON.parse(text);
      console.log("API Response:", data); // Debugging: Print parsed response
      dispatch(loginSuccess(data));
      navigation.replace("Dashboard");
    } catch (error) {
      console.error("Login Error:", error.message);
      dispatch(apiFail("Invalid email or password."));
    }
  };
  
// **Async Signup Action**
export const signupUser = (name, email, phone, password, navigation) => async (dispatch) => {
  dispatch(apiStart());
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Signup failed");

    dispatch(loginSuccess(data));
    navigation.replace("Dashboard"); // Navigate to Dashboard on success
  } catch (error) {
    dispatch(apiFail(error.message));
  }
};
