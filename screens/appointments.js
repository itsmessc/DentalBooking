import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Avatar, SegmentedButtons } from "react-native-paper";
import Constants from "expo-constants";
import AppointmentList from "../components/appointmentlist"; // Reusing the existing component
import { useSelector } from "react-redux";
import moment from "moment";

const API_URL = Constants.expoConfig.extra.API_URL;

const AllAppointments = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user, token } = useSelector((state) => state.auth);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("upcoming"); // Default filter: Upcoming

  // Fetch appointments from API
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/appointments/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch appointments");

      let data = await response.json();

      const now = moment();

      // Process data: Convert time format and sort properly
      data = data
        .map((item) => {
          // Convert 12-hour time format to 24-hour for sorting
          const fullDateTime = moment(`${item.date} ${item.time}`, "YYYY-MM-DD hh:mm A");

          return {
            ...item,
            fullDate: fullDateTime,
          };
        })
        .sort((a, b) => a.fullDate - b.fullDate); // Sort in ascending order

      setAppointments(data);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (isFocused) fetchAppointments();
  }, [isFocused, fetchAppointments]);

  // Filtered Appointments based on selected status
  const filteredAppointments = appointments.filter((item) => {
    const now = moment();

    if (filterStatus === "upcoming") {
      return item.status === "Confirmed" && item.fullDate.isAfter(now);
    }
    if (filterStatus === "completed") {
      return item.status === "Confirmed" && item.fullDate.isBefore(now);
    }
    if (filterStatus === "cancelled") {
      return item.status === "Cancelled";
    }

    return true; // Default case
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Avatar.Text
          size={50}
          label={user?.name ? user.name[0].toUpperCase() : "U"}
          style={styles.avatar}
          color="#007AFF"
        />
        <View>
          <Text style={styles.title}>All Appointments</Text>
          <Text style={styles.subtitle}>View all upcoming appointments</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <SegmentedButtons
        style={styles.filterButtons}
        value={filterStatus}
        onValueChange={setFilterStatus}
        buttons={[
          { value: "upcoming", label: "Upcoming", uncheckedColor: "#007AFF", checkedColor: "white", style: { backgroundColor: filterStatus === "upcoming" ? "#007AFF" : "white", borderColor: "#007AFF" } },
          { value: "completed", label: "Completed", uncheckedColor: "#007AFF", checkedColor: "white", style: { backgroundColor: filterStatus === "completed" ? "#007AFF" : "white", borderColor: "#007AFF" } },
          { value: "cancelled", label: "Cancelled", uncheckedColor: "#007AFF", checkedColor: "white", style: { backgroundColor: filterStatus === "cancelled" ? "#007AFF" : "white", borderColor: "#007AFF" } },
        ]}
      />

      {/* Loading & Appointment List */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <AppointmentList
          appointments={filteredAppointments}
          token={token}
          fetchAppointments={fetchAppointments}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    marginRight: 10,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 14,
    color: "white",
  },
  filterButtons: {
    margin: 10,
  },
  loader: {
    marginTop: 30,
  },
});

export default AllAppointments;
