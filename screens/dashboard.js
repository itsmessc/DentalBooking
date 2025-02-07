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

  useEffect(() => {
    if (isFocused) fetchAppointments();
  }, [isFocused, fetchAppointments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, [fetchAppointments]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    dispatch(logout());
    navigation.replace("Login");
  };

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

  const openMap = (lat, lng) => {
    const url = `https://www.google.com/maps/?q=${lat},${lng}`;
    Linking.openURL(url);
  };

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
          color="#007AFF"
        />
        <View>
          <Text style={styles.title}>Hi, {user?.name || "User"} 👋</Text>
          <Text style={styles.subtitle}>Your upcoming appointments</Text>
        </View>
        <IconButton icon="logout" size={24} iconColor="white" onPress={handleLogout} style={styles.IconButton} />
      </View>

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
          contentContainerStyle={{ paddingBottom: 10 }} // Removes unwanted opacity
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title
                title={item.serviceName}
                subtitle={`Dr. ${item.dentistName} • ${item.date} • ${item.time}`}
                left={(props) => (
                  <Avatar.Icon 
                    {...props} 
                    icon="tooth" 
                    style={styles.avatarIcon} // Fixes purple background
                    color="#007AFF" 
                    backgroundColor="#E6F0FF"
                  />
                )}
                right={(props) => (
                  <IconButton 
                    {...props} 
                    icon="eye" 
                    color="#007AFF" 
                    onPress={() => handleAppointmentDetails(item)}
                  />
                )}
              />
            </Card>
          )}
        />
      )}

      <Button mode="contained" onPress={() => navigation.navigate("LocationSelection")} style={styles.button}>
        + Book an Appointment
      </Button>

      {/* Popup Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Appointment Details</Text>

            <Text style={styles.detailText}><Text style={styles.label}>Location: </Text>{selectedAppointment?.officeName}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Service: </Text>{selectedAppointment?.serviceName}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Dentist: </Text>{selectedAppointment?.dentistName}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Date: </Text>{selectedAppointment?.date}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Time: </Text>{selectedAppointment?.time}</Text>

            <Button mode="contained" onPress={() => openMap(selectedAppointment?.location.lat, selectedAppointment?.location.lng)} style={styles.mapButton}>
              Open in Maps
            </Button>

            <Button mode="contained" onPress={() => cancelAppointment(selectedAppointment?.id)} style={styles.cancelButton}>
              Cancel Appointment
            </Button>

            <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.closeButton}>
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#007AFF", padding: 20 ,borderBottomLeftRadius: 20, borderBottomRightRadius: 20},  
  avatar: { marginRight: 10, backgroundColor: "white" },
  avatarIcon: { backgroundColor: "#E6F0FF" }, // Fix purple background
  title: { fontSize: 20, fontWeight: "bold", color: "white" },
  subtitle: { fontSize: 14, color: "white" },
  loader: { marginTop: 30 },
  card: { backgroundColor: "white", margin:5, borderRadius: 10, elevation: 3 },
  button: { margin: 20, backgroundColor: "#007AFF" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "85%", backgroundColor: "white", padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  mapButton: { marginTop: 10, backgroundColor: "#007AFF" },
  cancelButton: { marginTop: 10, backgroundColor: "#FF0000" },
  closeButton: { marginTop: 10, backgroundColor: "#28A745" },
  IconButton:{ marginLeft: "auto" },
});

export default Dashboard;
