import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Card, Avatar, IconButton, Button } from "react-native-paper";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { setRescheduleDetailsAndFetch } from "../redux/rescheduleSlice"; 
import * as Linking from "expo-linking";
import Constants from "expo-constants";
const AppointmentList = ({ appointments, token, fetchAppointments }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const API_URL=Constants.expoConfig.extra.API_URL;
  const handleAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await fetch(`${API_URL}/appointments/cancel/${appointmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Canceling appointment:", appointmentId);

      Alert.alert("Success", "Appointment canceled successfully");
      setModalVisible(false);
      fetchAppointments();
    } catch {
      Alert.alert("Error", "Failed to cancel appointment");
    }
  };

  const handleReschedule = (appointment) => {
    console.log("Rescheduling appointment:", appointment);
    dispatch(setRescheduleDetailsAndFetch(appointment));
    navigation.navigate("DateTimeSelection", { isRescheduling: true });
  };

  const openMap = (lat, lng) => {
    const url = `https://www.google.com/maps/?q=${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 10, marginBottom: 10 }}>
      {/* Appointment List */}
      <FlatList
        showsVerticalScrollIndicator={false}
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleAppointmentDetails(item)} activeOpacity={0.8}>
            <Card style={styles.card}>
              <Card.Title
                title={item.serviceName}
                subtitle={`${item.dentistName} • ${item.date} • ${item.time}`}
                left={(props) => (
                  <Avatar.Icon {...props} icon="tooth" style={styles.avatarIcon} color="#007AFF" backgroundColor="#E6F0FF" />
                )}
                right={(props) => (
                  <IconButton {...props} icon="eye" color="#007AFF" onPress={() => handleAppointmentDetails(item)} />
                )}
              />
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* Appointment Details Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Appointment Details</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Service:</Text> {selectedAppointment?.serviceName}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Dentist:</Text> {selectedAppointment?.dentistName}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Date:</Text> {selectedAppointment?.date}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Time:</Text> {selectedAppointment?.time}</Text>

            {/* Buttons */}
            <View style={styles.modalButtonContainer}>
              <Button 
                mode="contained" 
                style={styles.mapButton} 
                labelStyle={styles.buttonText} 
                onPress={() => openMap(selectedAppointment?.location?.lat, selectedAppointment?.location?.lng)}
              >
                Open Maps
              </Button>
              <Button 
                mode="contained" 
                style={styles.rescheduleButton} 
                labelStyle={styles.buttonText} 
                onPress={() => handleReschedule(selectedAppointment)}
              >
                Reschedule
              </Button>
              <Button 
                mode="contained" 
                style={styles.cancelButton} 
                labelStyle={styles.buttonText} 
                onPress={() => cancelAppointment(selectedAppointment?.id)}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                style={styles.closeButton} 
                labelStyle={styles.buttonText} 
                onPress={() => setModalVisible(false)}
              >
                Close
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: "white", 
    marginVertical: 5, 
    borderRadius: 10, 
    elevation: 3,
  },
  avatarIcon: { 
    backgroundColor: "#E6F0FF" 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    alignItems: "center",
  },
  modalContainer: { 
    width: "90%", 
    backgroundColor: "white", 
    padding: 20, 
    borderRadius: 10, 
    alignItems: "center",
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 10,
  },
  modalButtonContainer: { 
    flexDirection: "column", 
    justifyContent: "center", 
    alignItems: "center",
    width: "100%", 
    marginTop: 15,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  mapButton: { width: "90%", marginBottom: 10, backgroundColor: "#007AFF"},
  rescheduleButton: { width: "90%", marginBottom: 10, backgroundColor: "#FFA500" },
  cancelButton: { width: "90%", marginBottom: 10, backgroundColor: "#FF0000"},
  closeButton: { width: "90%", backgroundColor: "#28A745" },
});

export default AppointmentList;
