import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedOffice: null,
  selectedService: null,
  selectedDentist: null,
  appointmentDetails: {},
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setSelectedOffice: (state, action) => {
      state.selectedOffice = action.payload;
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    setSelectedDentist: (state, action) => {
      state.selectedDentist = action.payload;
    },
    setAppointmentDetails: (state, action) => {
      state.appointmentDetails = action.payload;
    },
    clearBooking: (state) => {
      state.selectedOffice = null;
      state.selectedService = null;
      state.selectedDentist = null;
      state.appointmentDetails = {};
    },
  },
});

export const {
  setSelectedOffice,
  setSelectedService,
  setSelectedDentist,
  setAppointmentDetails,
  clearBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
