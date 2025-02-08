import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.API_URL;

const initialState = {
    rescheduleAppointmentId: null,
    rescheduleDate: null,
    rescheduleTime: null,
    serviceId: null,
    serviceName: null,
    officeId: null,
    office: null,
    dentistId: null,
    dentist: null,
    isRescheduling: false,
    isLoading: false,
    error: null,
};

/**
 * Fetch Office Details from Backend
 */
export const fetchOfficeDetails = createAsyncThunk(
    "reschedule/fetchOfficeDetails",
    async (officeId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/dental-offices/${officeId}`);
            if (!response.ok) throw new Error("Failed to fetch office details");
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Fetch Dentist Details from Backend
 */
export const fetchDentistDetails = createAsyncThunk(
    "reschedule/fetchDentistDetails",
    async (dentistId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/dentists/${dentistId}`);
            if (!response.ok) throw new Error("Failed to fetch dentist details");
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Reschedule an Appointment
 */
export const rescheduleAppointment = createAsyncThunk(
    "reschedule/rescheduleAppointment",
    async ({ appointmentId, newDate, newTime, serviceId, officeId, dentistId }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/appointments/reschedule/${appointmentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    newDate: newDate,
                    newTime: newTime,
                    serviceId,
                    officeId,
                    dentistId,
                }),
            });

            if (!response.ok) throw new Error("Failed to reschedule appointment");
            return { appointmentId, newDate, newTime, serviceId, officeId, dentistId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const rescheduleSlice = createSlice({
    name: "reschedule",
    initialState,
    reducers: {
        setRescheduleDetails: (state, action) => {
            state.isRescheduling = true;
            state.rescheduleAppointmentId = action.payload.id;
            state.rescheduleDate = action.payload.date;
            state.rescheduleTime = action.payload.time;
            state.serviceId = action.payload.serviceId;
            state.serviceName = action.payload.serviceName;
            state.officeId = action.payload.officeId;
            state.dentistId = action.payload.dentistId;
            state.office = null;
            state.dentist = null;
        },
        setOfficeDetails: (state, action) => {
            state.office = action.payload;
        },
        setDentistDetails: (state, action) => {
            state.dentist = action.payload;
        },
        setRescheduleTime: (state, action) => {
            state.rescheduleTime = action.payload;
        },
        setRescheduleDate: (state, action) => {
            state.rescheduleDate = action.payload;
        },
        clearReschedule: (state) => {
            state.isRescheduling = false;
            state.rescheduleAppointmentId = null;
            state.rescheduleDate = null;
            state.rescheduleTime = null;
            state.serviceId = null;
            state.serviceName = null;
            state.officeId = null;
            state.office = null;
            state.dentistId = null;
            state.dentist = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOfficeDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOfficeDetails.fulfilled, (state, action) => {
                state.office = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchOfficeDetails.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchDentistDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDentistDetails.fulfilled, (state, action) => {
                state.dentist = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchDentistDetails.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(rescheduleAppointment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(rescheduleAppointment.fulfilled, (state, action) => {
                state.rescheduleDate = action.payload.newDate;
                state.rescheduleTime = action.payload.newTime;
                state.serviceId = action.payload.serviceId;
                state.officeId = action.payload.officeId;
                state.dentistId = action.payload.dentistId;
                state.isRescheduling = false;
                state.isLoading = false;
            })
            .addCase(rescheduleAppointment.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            });
    },
});



/**
 * Async function to fetch office and dentist details
 * when `setRescheduleDetails` is called
 */
export const setRescheduleDetailsAndFetch = (appointment) => async (dispatch) => {
    dispatch(setRescheduleDetails(appointment));

    try {
        if (appointment.officeId) {
            const officeResponse = await dispatch(fetchOfficeDetails(appointment.officeId));
            if (fetchOfficeDetails.fulfilled.match(officeResponse)) {
                dispatch(setOfficeDetails(officeResponse.payload)); // Store in Redux state
            }
        }

        if (appointment.dentistId) {
            const dentistResponse = await dispatch(fetchDentistDetails(appointment.dentistId));
            if (fetchDentistDetails.fulfilled.match(dentistResponse)) {
                dispatch(setDentistDetails(dentistResponse.payload)); // Store in Redux state
            }
        }
    } catch (error) {
        console.error("Error fetching reschedule details:", error);
    }
};


export const { setRescheduleDetails, clearReschedule, setDentistDetails, setOfficeDetails,setRescheduleTime,setRescheduleDate } = rescheduleSlice.actions;
export default rescheduleSlice.reducer;
