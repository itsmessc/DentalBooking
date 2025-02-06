import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// API Base URL
const API_URL = Constants.expoConfig.extra.API_URL;

// **Fetch Hospital Details**
export const fetchHospitalDetails = createAsyncThunk(
  "booking/fetchHospitalDetails",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/dental-offices/${hospitalId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch hospital details");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// **Fetch Dentists Based on Selected Service**
export const fetchDentists = createAsyncThunk(
  "booking/fetchDentists",
  async ({ officeId, serviceId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/dentists`);
      if (!response.ok) throw new Error("Failed to fetch dentists");
      
      const allDentists = await response.json();
      console.log("All Dentists:", allDentists);
      // Filter dentists based on selected office and service
      const filteredDentists = allDentists.filter(dentist => 
        dentist.officeId === officeId && 
        dentist.services.includes(serviceId) // Ensure the dentist offers the selected service
      );
      console.log("Filtered Dentists:", filteredDentists,serviceId,officeId);
      return filteredDentists;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// **Confirm Appointment**
export const confirmAppointment = createAsyncThunk(
  "booking/confirmAppointment",
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm appointment");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  selectedOffice: null,
  selectedService: null,
  selectedDentist: null,
  hospitalDetails: null,
  dentists: [],
  appointmentDetails: {},
  isLoading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setSelectedOffice: (state, action) => {
      state.selectedOffice = action.payload;
      AsyncStorage.setItem("selectedOffice", JSON.stringify(action.payload));
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
      AsyncStorage.setItem("selectedService", JSON.stringify(action.payload));
    },
    setSelectedDentist: (state, action) => {
      state.selectedDentist = action.payload;
      AsyncStorage.setItem("selectedDentist", JSON.stringify(action.payload));
    },
    clearBooking: (state) => {
      state.selectedOffice = null;
      state.selectedService = null;
      state.selectedDentist = null;
      state.hospitalDetails = null;
      state.dentists = [];
      state.appointmentDetails = {};
      AsyncStorage.removeItem("selectedOffice");
      AsyncStorage.removeItem("selectedService");
      AsyncStorage.removeItem("selectedDentist");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHospitalDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHospitalDetails.fulfilled, (state, action) => {
        state.hospitalDetails = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchHospitalDetails.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchDentists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDentists.fulfilled, (state, action) => {
        state.dentists = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchDentists.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      .addCase(confirmAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmAppointment.fulfilled, (state, action) => {
        state.appointmentDetails = action.payload;
        AsyncStorage.setItem("appointmentDetails", JSON.stringify(action.payload));
        state.isLoading = false;
      })
      .addCase(confirmAppointment.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

// **Export Actions & Reducer**
export const { setSelectedOffice, setSelectedService, setSelectedDentist, clearBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
