import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

const SuccessScreen = () => {
  const navigation = useNavigation();

  // Get Redux state for appointment details
  const { appointmentDetails } = useSelector((state) => state.booking);

  const handleBackToHome = () => {
    navigation.navigate("Home"); // Adjust this as per your navigation setup
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Booking Confirmed</Text>
      <Text style={styles.subHeader}>Your appointment has been successfully booked!</Text>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Location:</Text> {appointmentDetails?.officeName}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Service:</Text> {appointmentDetails?.serviceName}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Dentist:</Text> {appointmentDetails?.dentistName}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Date:</Text> {appointmentDetails?.date}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Time:</Text> {appointmentDetails?.time}
        </Text>
      </View>

      <Button title="Back to Home" onPress={handleBackToHome} color="#28A745" />
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
  },
  detailsContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    width: "100%",
  },
  label: {
    fontWeight: "bold",
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default SuccessScreen;
