import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Avatar, Card, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedOffice } from "../redux/bookingSlice";
import { fetchDentalOffices } from "../redux/locationSlice"; // Fetching locations
import Constants from "expo-constants";

// API Base URL
const API_URL = Constants.expoConfig.extra.API_URL;

const LocationSelection = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux State
  const { dentalOffices, loading, error, postalCode } = useSelector((state) => state.location);

  // Local State for Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOffices, setFilteredOffices] = useState([]);

  // Fetch Dental Offices
  useEffect(() => {
    dispatch(fetchDentalOffices());
  }, [dispatch]);

  // Update the filtered list when data changes
  useEffect(() => {
    setFilteredOffices(dentalOffices);
  }, [dentalOffices]);

  // Handle Search Input
  const handleSearch = (text) => {
    setSearchQuery(text);

    if (text.trim() === "") {
      setFilteredOffices(dentalOffices); // Reset when search is cleared
    } else {
      const filtered = dentalOffices.filter((office) =>
        office.name.toLowerCase().includes(text.toLowerCase()) ||
        office.city.toLowerCase().includes(text.toLowerCase()) ||
        office.zip.toString().includes(text)
      );
      setFilteredOffices(filtered);
    }
  };

  // Select a Dental Office
  const selectOffice = (office) => {
    dispatch(setSelectedOffice(office));
    navigation.navigate("ServiceSelection");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar.Icon size={50} icon="map-marker" style={styles.avatarIcon} color="#007AFF" />
        <View>
          <Text style={styles.title}>Your Location</Text>
          <Text style={styles.subtitle}>Postal Code: {postalCode || "Unknown"}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by city, ZIP, or address..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <Text style={styles.sectionTitle}>Nearest Hospitals</Text>

      {/* Loading & Error Handling */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : filteredOffices.length === 0 ? (
        <Text style={styles.noResults}>No offices found.</Text>
      ) : (
        <FlatList
          data={filteredOffices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => selectOffice(item)}>
              <Card style={styles.card}>
                <Card.Title
                  title={item.name}
                  subtitle={`${item.address} - ${item.city}, ${item.zip} • ${item.distance.toFixed(1)} km\n⭐ ${item.rating ? item.rating.toFixed(1) : "N/A"} / 5`}
                  left={(props) => (
                    <Avatar.Icon
                      {...props}
                      icon="hospital-building"
                      style={styles.officeAvatar}
                      color="#007AFF"
                      backgroundColor="#E6F0FF"
                    />
                  )}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon="chevron-right"
                      color="#007AFF"
                      size={28}
                    />
                  )}
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
  
  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarIcon: { backgroundColor: "white", marginRight: 10 },
  title: { fontSize: 20, fontWeight: "bold", color: "white" },
  subtitle: { fontSize: 14, color: "white" },

  // Search Bar
  searchBar: {
    margin: 15,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 10,
    color: "#333",
  },

  // Loader & Error Text
  loader: { marginTop: 30 },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginTop: 10 },
  noResults: { fontSize: 16, fontStyle: "italic", textAlign: "center", color: "gray", marginTop: 20 },

  // Cards
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "white",
  },
  officeAvatar: {
    backgroundColor: "#E6F0FF", // Fixes purple background
  },
});

export default LocationSelection;
