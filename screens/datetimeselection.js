import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Card, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDate, setSelectedTime } from "../redux/bookingSlice";
import CalendarPicker from "react-native-calendar-picker";
import moment from "moment";

const DateTimeSelection = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Get Redux state
  const { selectedDentist, selectedOffice, selectedDate, selectedTime } = useSelector((state) => state.booking);

  // Set Default Date to Today
  const [currentDate, setCurrentDate] = useState(moment().format("YYYY-MM-DD"));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle Date Change
  const handleDateChange = (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    setCurrentDate(formattedDate); // Update local state
    dispatch(setSelectedDate(formattedDate)); // Update Redux state
  };

  // Generate available time slots based on opening hours
  useEffect(() => {
    if (!selectedDentist || !selectedOffice) return;

    const officeHours = selectedOffice.openingHours[moment(currentDate).format("dddd")]; // Get opening hours for the selected day
    if (!officeHours || officeHours === "Closed") {
      setAvailableSlots([]);
      return;
    }

    const [start, end] = officeHours.split(" - ");
    const openingTime = moment(start, "hh:mm A");
    const closingTime = moment(end, "hh:mm A");
    const interval = 30; // 30-minute slots

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
      const currentTime = moment(); // Get current time
      filteredSlots = filteredSlots.filter(
        (slot) => moment(slot, "hh:mm A").isAfter(currentTime)
      );
    }

    setAvailableSlots(filteredSlots);
  }, [currentDate, selectedDentist]);

  // Handle time slot selection
  const handleTimeSelection = (time) => {
    dispatch(setSelectedTime(time));
  };

  // Proceed to final confirmation
  const proceedToConfirmation = () => {
    if (!currentDate || !selectedTime) {
      alert("Please select both date and time.");
      return;
    }
    navigation.navigate("ConfirmationScreen"); // Navigate to final step
  };

  return (
    <View style={styles.container}>
      
      <Text style={styles.selectedDate}>
        Select Appointment Slot
      </Text>
      {/*  Move Date Picker to Top */}
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
                selectedTime === item && styles.selectedSlot,
              ]}
            >
              <Text
                style={[
                  styles.slotText,
                  selectedTime === item && styles.selectedSlotText, // White text when selected
                ]}
              >
                {item}
              </Text>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/*  Fixed Bottom Button */}
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={proceedToConfirmation} style={styles.proceedButton}>
          Proceed to Confirmation
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", padding: 10 },

  // List
  list: { flex: 1 },

  //  Selected Date Display
  selectedDate: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "balck",
    marginBottom: 5,
  },
  header: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },

  // Calendar
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },

  // No Available Slots
  noSlots: {
    fontSize: 16,
    textAlign: "center",
    color: "gray",
    marginTop: 10,
  },

  // Time Slot Container
  slotContainer: {
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80, 
  },

  // Time Slot Styling
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

  // Fixed Bottom Button
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
