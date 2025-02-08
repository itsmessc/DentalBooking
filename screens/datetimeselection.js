import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Card, Button } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDate, setSelectedTime } from "../redux/bookingSlice";
import { setRescheduleTime, setRescheduleDate, rescheduleAppointment, clearReschedule } from "../redux/rescheduleSlice";
import CalendarPicker from "react-native-calendar-picker";
import moment from "moment";

const DateTimeSelection = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  // Check if the user is rescheduling (from route params)
  const isRescheduling = route.params?.isRescheduling || false;

  // Get Redux state
  const bookingState = useSelector((state) => state.booking);
  const rescheduleState = useSelector((state) => state.reschedule);

  // Select correct values based on the flow (normal booking or rescheduling)
  const selectedDentist = isRescheduling ? rescheduleState.dentist : bookingState.selectedDentist;
  const selectedOffice = isRescheduling ? rescheduleState.office : bookingState.selectedOffice;
  const selectedDate = isRescheduling ? rescheduleState.rescheduleDate : bookingState.selectedDate;
  const selectedTime = isRescheduling ? rescheduleState.rescheduleTime : bookingState.selectedTime;
  const rescheduleAppointmentId = rescheduleState.rescheduleAppointmentId;

  // Set Default Date to Today
  const [currentDate, setCurrentDate] = useState(selectedDate || moment().format("YYYY-MM-DD"));
  const [currentTime, setCurrentTime] = useState(selectedTime || null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle Date Change
  const handleDateChange = (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    setCurrentDate(formattedDate);

    if (isRescheduling) {
      dispatch(setRescheduleDate(formattedDate)); 
    } else {
      dispatch(setSelectedDate(formattedDate));
    }

    setCurrentTime(null); // Reset selected time when date changes
  };

  // Generate available time slots based on opening hours
  useEffect(() => {
    if (!selectedDentist || !selectedOffice) return;

    const officeHours = selectedOffice.openingHours[moment(currentDate).format("dddd")];
    if (!officeHours || officeHours === "Closed") {
      setAvailableSlots([]);
      return;
    }

    const [start, end] = officeHours.split(" - ");
    const openingTime = moment(start, "hh:mm A");
    const closingTime = moment(end, "hh:mm A");
    const interval = 30;

    let slots = [];
    while (openingTime.isBefore(closingTime)) {
      slots.push(openingTime.format("hh:mm A"));
      openingTime.add(interval, "minutes");
    }

    // Filter out unavailable slots
    const unavailableSlots = selectedDentist.unavailableSlots?.find(
      (slot) => slot.date === currentDate
    )?.times || [];

    let filteredSlots = slots.filter((slot) => !unavailableSlots.includes(slot));

    // Remove past times if today is selected
    if (currentDate === moment().format("YYYY-MM-DD")) {
      const currentTime = moment();
      filteredSlots = filteredSlots.filter(
        (slot) => moment(slot, "hh:mm A").isAfter(currentTime)
      );
    }

    setAvailableSlots(filteredSlots);
  }, [currentDate, selectedDentist]);

  // Handle time slot selection
  const handleTimeSelection = (time) => {
    setCurrentTime(time); // Update local state to reflect selected time in UI

    if (isRescheduling) {
      dispatch(setRescheduleTime(time));
    } else {
      dispatch(setSelectedTime(time));
    }
  };

  // Proceed to final confirmation
  const proceedToConfirmation = () => {
    if (!currentDate || !currentTime) {
      alert("Please select both date and time.");
      return;
    }

    if (isRescheduling) {
      dispatch(
        rescheduleAppointment({
          appointmentId: rescheduleAppointmentId,
          newDate: currentDate,
          newTime: currentTime,
          serviceId: rescheduleState.serviceId,
          officeId: rescheduleState.officeId,
          dentistId: rescheduleState.dentistId,
        })
      );
      Alert.alert("Success", "Appointment rescheduled successfully!");
      dispatch(clearReschedule());
      navigation.goBack();
    } else {
      navigation.navigate("ConfirmationScreen");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.selectedDate}>Select Appointment Slot</Text>

      <View style={styles.calendarContainer}>
        <CalendarPicker
          onDateChange={handleDateChange}
          minDate={new Date()}
          selectedStartDate={currentDate}
          textStyle={{ color: "#000" }}
          todayBackgroundColor="#E6F0FF"
          selectedDayColor="#007AFF"
          selectedDayTextColor="#FFFFFF"
        />
      </View>

      <FlatList
        data={availableSlots}
        keyExtractor={(item) => item}
        numColumns={3}
        style={styles.list}
        contentContainerStyle={styles.slotContainer}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Available Time Slots</Text>
            {loading && <ActivityIndicator size="large" color="#007AFF" />}
            {availableSlots.length === 0 && !loading && (
              <Text style={styles.noSlots}>No available slots for this day.</Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleTimeSelection(item)}>
            <Card
              style={[
                styles.timeSlot,
                currentTime === item && styles.selectedSlot,
              ]}
            >
              <Text
                style={[
                  styles.slotText,
                  currentTime === item && styles.selectedSlotText,
                ]}
              >
                {item}
              </Text>
            </Card>
          </TouchableOpacity>
        )}
      />

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={proceedToConfirmation} style={styles.proceedButton}>
          {isRescheduling ? "Reschedule Appointment" : "Proceed to Confirmation"}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", padding: 10 },
  list: { flex: 1 },
  selectedDate: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "black",
    marginBottom: 5,
  },
  header: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  noSlots: {
    fontSize: 16,
    textAlign: "center",
    color: "gray",
    marginTop: 10,
  },
  slotContainer: {
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  timeSlot: {
    padding: 15,
    margin: 5,
    borderRadius: 5,
    backgroundColor: "#E3E3E3",
    alignItems: "center",
    justifyContent: "center",
    width: 100,
  },
  selectedSlot: {
    backgroundColor: "#007AFF",
  },
  slotText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  selectedSlotText: {
    color: "#FFFFFF",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 15,
    elevation: 10,
  },
  proceedButton: {
    padding: 12,
    backgroundColor: "#007AFF",
    borderRadius: 10,
  },
});

export default DateTimeSelection;
