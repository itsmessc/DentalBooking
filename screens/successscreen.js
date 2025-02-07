import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { clearBooking } from "../redux/bookingSlice";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons"; // Icons for UI

const SuccessScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Get Redux state for appointment details
  const { appointmentDetails } = useSelector((state) => state.booking);

  const handleBackToHome = () => {
    dispatch(clearBooking()); // Clear booking details
    navigation.navigate("Dashboard"); // Adjust this as per your navigation setup
  };

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <View style={styles.successIconContainer}>
        <MaterialIcons name="check-circle" size={90} color="#28A745" />
      </View>

      <Text style={styles.header}>Booking Confirmed!</Text>
      <Text style={styles.subHeader}>Your appointment has been successfully booked.</Text>

      {/* Appointment Details Card */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={22} color="#007AFF" />
          <Text style={styles.detailText}>{appointmentDetails?.officeName}</Text>
        </View>

        <View style={styles.detailRow}>
          <FontAwesome5 name="tooth" size={20} color="#007AFF" />
          <Text style={styles.detailText}>{appointmentDetails?.serviceName}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="person" size={22} color="#007AFF" />
          <Text style={styles.detailText}>{appointmentDetails?.dentistName}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="event" size={22} color="#007AFF" />
          <Text style={styles.detailText}>{appointmentDetails?.date}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="schedule" size={22} color="#007AFF" />
          <Text style={styles.detailText}>{appointmentDetails?.time}</Text>
        </View>
      </View>

      {/* Back to Home Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Success Icon
  successIconContainer: {
    marginBottom: 20,
  },

  // Headers
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subHeader: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    color: "#555",
  },

  // Appointment Details Card
  detailsContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    width: "100%",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 10, // Space between icon & text
  },

  // Button Container
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
  },
  homeButton: {
    backgroundColor: "#28A745",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

export default SuccessScreen;
