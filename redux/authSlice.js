import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// API Base URL
const API_URL = Constants.expoConfig.extra.API_URL; 

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

    // Login Success (Persist User Data)
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
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

    // Logout (Remove from AsyncStorage)
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      AsyncStorage.removeItem("user");
      AsyncStorage.removeItem("token");
    },

    // Restore User Session (Load from AsyncStorage)
    restoreSession: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.token; // If token exists, set authenticated
    },
  },
});

export const { apiStart, loginSuccess, apiFail, logout, restoreSession } = authSlice.actions;
export default authSlice.reducer;

// ** Async Function to Load User on App Start**
export const loadUserSession = () => async (dispatch) => {
  try {
    const storedUser = await AsyncStorage.getItem("user");
    const storedToken = await AsyncStorage.getItem("token");

    if (storedUser && storedToken) {
      dispatch(restoreSession({ user: JSON.parse(storedUser), token: storedToken }));
    }
  } catch (error) {
    console.error("Failed to load session:", error);
  }
};

// ** Async Login Action**
export const loginUser = (email, password, navigation) => async (dispatch) => {
  dispatch(apiStart());
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Invalid email or password.");

    dispatch(loginSuccess(data));
    navigation.replace("BottomNavigation");
  } catch (error) {
    console.error("Login Error:", error.message);
    dispatch(apiFail(error.message));
  }
};

// ** Async Signup Action**
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
    navigation.replace("BottomNavigation");
  } catch (error) {
    dispatch(apiFail(error.message));
  }
};
