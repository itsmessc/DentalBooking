import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Modal,
  TouchableOpacity
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Button, Card, Avatar, IconButton } from "react-native-paper";
import Constants from "expo-constants";
import * as Linking from 'expo-linking';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Fetch Appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/appointments/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch appointments");

      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError("No Appointments Found");
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Fetch data on screen focus
  useEffect(() => {
    if (isFocused) fetchAppointments();
  }, [isFocused, fetchAppointments]);

  // Pull-to-refresh Function
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

  // Handle Appointment Cancellation
  const cancelAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`${API_URL}/appointments/cancel/${appointmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to cancel appointment");

      Alert.alert("Success", "Appointment canceled successfully");
      setModalVisible(false);
      fetchAppointments();
    } catch (err) {
      Alert.alert("Error", "Failed to cancel the appointment. Please try again.");
    }
  };

  // Open Google Maps or other maps
  const openMap = (lat, lng) => {
    const url = `https://www.google.com/maps/?q=${lat},${lng}`;
    Linking.openURL(url);
  };

  // Handle Appointment Details Modal
  const handleAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />

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
          iconColor="white"
          style={{ marginLeft: "auto" }}
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title
                title={item.serviceName}
                subtitle={`Dr. ${item.dentistName} • ${item.date} • ${item.time}`}
                left={(props) => <Avatar.Icon {...props} icon="tooth" />}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="eye"
                    color="blue"
                    onPress={() => handleAppointmentDetails(item)} 
                  />
                )}
              />
            </Card>
          )}
        />
      )}

      <Button
        mode="contained"
        onPress={() => navigation.navigate("LocationSelection")}
        style={styles.button}
      >
        + Book an Appointment
      </Button>

      {/* Appointment Details Modal */}
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Appointment Details</Text>

          <Text style={styles.detailText}>
            <Text style={styles.label}>Location: </Text>{selectedAppointment?.officeName}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Service: </Text>{selectedAppointment?.serviceName}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Dentist: </Text>{selectedAppointment?.dentistName}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Date: </Text>{selectedAppointment?.date}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Time: </Text>{selectedAppointment?.time}
          </Text>

          {/* Location Button */}
          <Button
            mode="contained"
            onPress={() => openMap(selectedAppointment?.location.lat, selectedAppointment?.location.lng)}
            style={styles.mapButton}
          >
            Open in Maps
          </Button>

          <Button
            mode="contained"
            onPress={() => cancelAppointment(selectedAppointment?.id)}
            style={styles.cancelButton}
          >
            Cancel Appointment
          </Button>

          <Button
            mode="contained"
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
          >
            Close
          </Button>
        </View>
      </Modal>
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
  detailsButton: { marginTop: 10 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "white" },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  detailText: { fontSize: 16, marginBottom: 10 },
  label: { fontWeight: "bold" },
  mapButton: { marginTop: 20, backgroundColor: "#007AFF" },
  cancelButton: { marginTop: 10, backgroundColor: "#FF0000" },
  closeButton: { marginTop: 10, backgroundColor: "#28A745" },
});

export default Dashboard;

