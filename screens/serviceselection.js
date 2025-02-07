import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Card, Button, Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchHospitalDetails, setSelectedService } from "../redux/bookingSlice";
import Constants from "expo-constants";

// API Base URL
const API_URL = Constants.expoConfig.extra.API_URL;
const GEOAPIFY_API_KEY = Constants.expoConfig.extra.GEOAPIFY_API_KEY;

const ServiceSelection = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Local State for Modal Visibility
  const [modalVisible, setModalVisible] = useState(false);

  // Get Redux state
  const { selectedOffice, hospitalDetails, selectedService, isLoading } = useSelector((state) => state.booking);

  // Fetch hospital details if not already fetched
  useEffect(() => {
    if (selectedOffice && !hospitalDetails) {
      dispatch(fetchHospitalDetails(selectedOffice.id));
    }
  }, [selectedOffice, dispatch]);

  // Generate the map URL
  const mapUrl = hospitalDetails
    ? `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=600&height=400&center=lonlat:${hospitalDetails.location.lng},${hospitalDetails.location.lat}&zoom=15&marker=lonlat:${hospitalDetails.location.lng},${hospitalDetails.location.lat};type:awesome;color:%23bb3f73;size:x-large&apiKey=${GEOAPIFY_API_KEY}`
    : "";

  // Function to select a service
  const selectService = (service) => {
    dispatch(setSelectedService({ id: service.id, name: service.name, price: service.price }));
  };

  // Proceed to the next step
  const proceedToBooking = () => {
    if (selectedService) {
      navigation.navigate("DentistSelection");
    } else {
      alert("Please select a service to proceed.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {isLoading || !hospitalDetails ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <>
            {/* Compact Hospital Information Card */}
            <Card style={styles.hospitalCard}>
              <Card.Title
                title={hospitalDetails.name}
                titleNumberOfLines={2}
                left={(props) => <Avatar.Icon {...props} icon="hospital-building" color="white" style={styles.hospitalIcon} />}
              />
              <Card.Content>
                <Text style={styles.detailText}>
                  <Text style={styles.label}>Address:</Text> {hospitalDetails.address || "Not Available"}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.label}>Phone:</Text> {hospitalDetails.contact || "Not Available"}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.label}>Rating:</Text> {hospitalDetails.rating || "Not Available"}
                </Text>

                {/* View Opening Hours Button */}
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Text style={styles.openingHoursText}>View Opening Hours</Text>
                </TouchableOpacity>
              </Card.Content>

              {/* Map Image */}
              {mapUrl ? (
                <Image source={{ uri: mapUrl }} style={styles.mapImage} resizeMode="cover" />
              ) : (
                <Text style={styles.errorText}>Map not available</Text>
              )}
            </Card>

            {/* Available Services */}
            <Text style={styles.sectionTitle}>Available Services</Text>
            <View style={styles.servicesContainer}>
              {hospitalDetails.services?.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => selectService(item)}>
                  <Card style={[styles.card, selectedService?.id === item.id && styles.selectedCard]}>
                    <Card.Title title={item.name} titleStyle={styles.cardTitle} />
                    <Card.Content>
                      <Text style={styles.description}>{item.description || "No description available."}</Text>
                      <Text style={styles.price}>Price: ₹{item.price}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Fixed Proceed Button */}
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={proceedToBooking} style={styles.proceedButton}>
          Proceed to Booking
        </Button>
      </View>

      {/* Opening Hours Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Opening Hours</Text>
            {hospitalDetails?.openingHours ? (
              Object.entries(hospitalDetails.openingHours).map(([day, time]) => (
                <Text key={day} style={styles.modalText}>
                  {day}: {time}
                </Text>
              ))
            ) : (
              <Text style={styles.modalText}>Not Available</Text>
            )}
            <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.closeButton}>
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" ,padding: 10},

  scrollContainer: { paddingBottom: 80 },

  // Hospital Card (Compact)
  hospitalCard: {
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "white",
    padding: 10,
  },
  hospitalIcon: {
    backgroundColor: "#007AFF",
  },
  mapImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginTop: 10,
  },

  // Titles & Text
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
    color: "#333",
  },
  detailText: {
    fontSize: 13,
    marginBottom: 5,
    color: "#333",
  },
  label: {
    fontWeight: "bold",
  },
  openingHoursText:{color: "#007AFF"},

  // Services List
  servicesContainer: {
    marginBottom: 20,
  },
  card: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },
  selectedCard: {
    borderColor: "#007AFF",
    borderWidth: 2,
    backgroundColor: "#E6F0FF",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    color: "#333",
  },

  // Fixed Bottom Button
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 10,
  },
  proceedButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 10,
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "85%", backgroundColor: "white", padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, marginBottom: 5 },
  closeButton: { marginTop: 10, backgroundColor: "#007AFF" },
});

export default ServiceSelection;
