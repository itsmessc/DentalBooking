import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Location from "expo-location"; // Import Expo Location API
import { Avatar, Card, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { clearBooking, setSelectedOffice } from "../redux/bookingSlice";
import { fetchDentalOffices } from "../redux/locationSlice"; // New Redux slice for fetching locations
import Constants from "expo-constants";

// API Base URL
const API_URL = Constants.expoConfig.extra.API_URL;

// Haversine Formula for Distance Calculation
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const toRad = (angle) => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const LocationSelection = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Get data from Redux
  const {
    dentalOffices,
    loading,
    error,
    userLocation,
    postalCode,
  } = useSelector((state) => state.location);

  useEffect(() => {
    dispatch(clearBooking());
    }, [navigation]);
  
  // Fetch User's Location and Dental Offices
  useEffect(() => {
    dispatch(fetchDentalOffices());
  }, [dispatch]);

  // Handle Search Input
  const handleSearch = (text) => {
    dispatch({ type: "location/filterOffices", payload: text });
  };

  // Select Dental Office
  const selectOffice = (office) => {
    dispatch(setSelectedOffice(office));
    navigation.navigate("ServiceSelection");
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Avatar.Icon size={50} icon="map-marker" style={styles.avatar} />
        <View>
          <Text style={styles.title}>Your Location</Text>
          <Text style={styles.subtitle}>Postal Code: {postalCode || "Unknown"}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by city, ZIP, or address..."
        onChangeText={handleSearch}
      />
      <Text style={styles.subtitle1}>Nearest Hospitals</Text>

      {/* Loading & Error Handling */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : dentalOffices.length === 0 ? (
        <Text style={styles.noResults}>No offices found.</Text>
      ) : (
        <FlatList
          data={dentalOffices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => selectOffice(item)}>
              <Card style={styles.card}>
                <Card.Title
                  title={item.name}
                  subtitle={`${item.address} - ${item.city}, ${item.zip} • ${item.distance.toFixed(1)} km\n⭐ ${item.rating ? item.rating.toFixed(1) : "N/A"} / 5`}
                  left={(props) => <Avatar.Icon {...props} icon="hospital-building" />}
                  right={(props) => <IconButton {...props} icon="arrow-right-circle" color="blue" />}
                />
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: { backgroundColor: "white", marginRight: 10 },
  title: { fontSize: 18, fontWeight: "bold", color: "white" },
  subtitle: { fontSize: 14, color: "white" },
  subtitle1: { fontSize: 14, color: "black", marginLeft: 16 },
  searchBar: {
    margin: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  loader: { marginTop: 30 },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginTop: 10 },
  noResults: { fontSize: 16, fontStyle: "italic", textAlign: "center", color: "gray", marginTop: 20 },
  card: { marginHorizontal: 15, marginVertical: 10, borderRadius: 10, elevation: 3 },
});

export default LocationSelection;
