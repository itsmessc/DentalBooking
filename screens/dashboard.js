import React, { useEffect, useState, useCallback } from "react";
import { 
  View, StyleSheet, Text, FlatList, ActivityIndicator, Alert, RefreshControl, StatusBar, SafeAreaView 
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Button, Card, Avatar, IconButton } from "react-native-paper";
import Constants from "expo-constants";

// API Base URL
const API_URL = Constants.expoConfig.extra.API_URL;

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user, token } = useSelector((state) => state.auth);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching Appointments for User:", user);

      const response = await fetch(`${API_URL}/appointments/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch appointments");

      const data = await response.json();
      console.log("Appointments Data:", JSON.stringify(data, null, 2));

      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("No Appointments Found");
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Fetch data on screen focus
  useEffect(() => {
    if (isFocused) fetchAppointments();
  }, [isFocused, fetchAppointments]);

  //  Pull-to-refresh Function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, [fetchAppointments]);

  // Handle Logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    dispatch(logout());
    navigation.replace("Login");
  };

  //  Handle Appointment Cancellation
  const cancelAppointment = async (appointmentId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/appointments/cancel/${appointmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to cancel appointment");

      Alert.alert("Success", "Appointment canceled successfully");
      fetchAppointments();
    } catch (err) {
      console.error("Error canceling appointment:", err);
      Alert.alert("Error", "Failed to cancel the appointment. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Status Bar (Black) */}
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />

      {/* Header Section */}
      <View style={styles.header}>
        <Avatar.Text 
          size={50} 
          label={user?.name ? user.name[0].toUpperCase() : "U"} 
          style={styles.avatar} 
        />
        <View>
          <Text style={styles.title}>Hi, {user?.name || "User"} 👋</Text>
          <Text style={styles.subtitle}>Your upcoming appointments</Text>
        </View>
        <IconButton 
          icon="logout" 
          size={24} 
          color="white" 
          onPress={handleLogout} 
        />
      </View>

      {/* Appointments List */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : appointments.length === 0 ? (
        <Text style={styles.noAppointments}>No upcoming appointments.</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title
                title={item.serviceName}
                subtitle={`Dr. ${item.dentistName} • ${item.date} • ${item.time}`}
                left={(props) => <Avatar.Icon {...props} icon="tooth" />}
                right={(props) => (
                  <IconButton 
                    {...props} 
                    icon="close-circle" 
                    color="red" 
                    onPress={() => cancelAppointment(item.id)} 
                  />
                )}
              />
            </Card>
          )}
        />
      )}

      {/* Action Buttons */}
      <Button
        mode="contained"
        onPress={() => navigation.navigate("LocationSelection")}
        style={styles.button}
      >
        + Book an Appointment
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: { marginRight: 10, backgroundColor: "white" },
  title: { fontSize: 20, fontWeight: "bold", color: "white" },
  subtitle: { fontSize: 14, color: "white" },
  loader: { marginTop: 30 },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginTop: 10 },
  noAppointments: { fontSize: 16, fontStyle: "italic", textAlign: "center", color: "gray", marginTop: 20 },
  card: { marginHorizontal: 15, marginVertical: 10, borderRadius: 10, elevation: 3 },
  button: { margin: 20, padding: 10, borderRadius: 10, backgroundColor: "#007AFF" },
});

export default Dashboard;
