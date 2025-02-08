import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  SafeAreaView
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Avatar, IconButton, FAB } from "react-native-paper";
import Constants from "expo-constants";
import AppointmentList from "../components/appointmentlist"; // Importing the updated component

const API_URL = Constants.expoConfig.extra.API_URL;

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user, token } = useSelector((state) => state.auth);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/appointments/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error("Failed to fetch appointments");
  
      let data = await response.json();
  
      // Filter only confirmed appointments
      data = data.filter((item) => item.status.toLowerCase() === "confirmed");
  
      // Convert 12-hour time format (AM/PM) to Date objects and sort
      data = data
        .map((item) => {
          // Ensure date and time are properly formatted
          const dateParts = item.date.split("-"); // Example: "2024-02-10"
          const [time, meridian] = item.time.split(" "); // Example: "02:30 PM"
          const [hoursStr, minutesStr] = time.split(":");
  
          // Convert time to 24-hour format
          let hours = parseInt(hoursStr, 10);
          const minutes = parseInt(minutesStr, 10);
  
          if (meridian === "PM" && hours !== 12) {
            hours += 12;
          } else if (meridian === "AM" && hours === 12) {
            hours = 0;
          }
  
          // Convert to a Date object
          return {
            ...item,
            fullDate: new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10), hours, minutes),
          };
        })
        .filter((item) => item.fullDate >= new Date()) // Remove past appointments
        .sort((a, b) => a.fullDate - b.fullDate); // Sort by time in ascending order
  
      // Get only the first 10 earliest upcoming appointments
      setAppointments(data.slice(0, 10));
  
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user, token]);
  


  useEffect(() => {
    if (isFocused) fetchAppointments();
  }, [isFocused, fetchAppointments]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />
      <View style={styles.header}>
        <Avatar.Text
          size={50}
          label={user?.name ? user.name[0].toUpperCase() : "U"}
          style={styles.avatar}
          color="#007AFF"
        />
        <View>
          <Text style={styles.title}>Hi, {user?.name || "User"} 👋</Text>
          <Text style={styles.subtitle}>Your upcoming appointments</Text>
        </View>
        <IconButton icon="logout" size={24} iconColor="white" onPress={() => dispatch(logout())} style={styles.IconButton} />
      </View>

      {loading ? <ActivityIndicator size="large" color="#007AFF" /> : <AppointmentList appointments={appointments} token={token} fetchAppointments={fetchAppointments} />}

      <FAB icon="plus" label="Book Appointment" style={styles.fab} color="white" onPress={() => navigation.navigate("LocationSelection")} />
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
    borderBottomRightRadius: 20
  },
  avatar: {
    marginRight: 10,
    backgroundColor: "white"

  },
  avatarIcon: {
    backgroundColor: "#E6F0FF"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white"

  },
  subtitle: {
    fontSize: 14,
    color: "white"

  },
  logout: {
    marginLeft: "auto",
    color: "white"

  },
  loader: {
    marginTop: 30,
  },
  fab: {
    position: "absolute",
    right: 5,
    bottom: 5,
    backgroundColor: "#007AFF",
  },
  IconButton: {
    marginLeft: "auto",
    color: "white"
  }
});


export default Dashboard;
