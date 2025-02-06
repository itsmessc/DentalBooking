import React, { useState, useEffect } from "react";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [dentalOffices, setDentalOffices] = useState([]);
    const [filteredOffices, setFilteredOffices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [postalCode, setPostalCode] = useState("");

    // Fetch User's Location
    useEffect(() => {
        const fetchUserLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Location Permission Denied", "Enable location to see nearby dental offices.");
                setError("Location permission denied");
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            setUserLocation({ latitude, longitude });

            // Reverse Geocode to get Postal Code
            const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
            setPostalCode(address.postalCode || "Unknown");
        };

        fetchUserLocation();
    }, []);

    // Fetch Dental Offices and Sort by Distance
    useEffect(() => {
        const fetchOffices = async () => {
            setLoading(true);
            try {
                const response = await fetch(API_URL);
                let data = await response.json();

                if (userLocation) {
                    // Calculate distance and sort
                    data = data.map((office) => ({
                        ...office,
                        distance: getDistance(userLocation.latitude, userLocation.longitude, office.location.lat, office.location.lng),
                    })).sort((a, b) => a.distance - b.distance); // Sort by nearest
                }

                setDentalOffices(data);
                setFilteredOffices(data);
            } catch (err) {
                console.error("Error fetching offices:", err);
                setError("Failed to load dental offices.");
            } finally {
                setLoading(false);
            }
        };

        if (userLocation) fetchOffices();
    }, [userLocation]);

    // Handle Search Input
    const handleSearch = (text) => {
        setSearchQuery(text);
        if (!text) {
            setFilteredOffices(dentalOffices);
            return;
        }
        const filtered = dentalOffices.filter(
            (office) =>
                office.name.toLowerCase().includes(text.toLowerCase()) ||
                office.address.toLowerCase().includes(text.toLowerCase()) ||
                office.city.toLowerCase().includes(text.toLowerCase()) ||
                office.zip.includes(text)
        );
        setFilteredOffices(filtered);
    };

    // Select Dental Office
    const selectOffice = (office) => {
        console.log("Selected Office:", office);
        navigation.navigate("ServiceSelection", { selectedOffice: office });
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Avatar.Icon size={50} icon="map-marker" style={styles.avatar} />
                <View>
                    <Text style={styles.title}>Your Location</Text>
                    <Text style={styles.subtitle}>Postal Code: {postalCode}</Text>
                </View>
            </View>

            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search by city, ZIP, or address..."
                value={searchQuery}
                onChangeText={handleSearch}
            />
            <Text style={styles.subtitle1}>Nearest Hospitals</Text>
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
    container: {
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
      backgroundColor: "white",
      marginRight: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: "white",
    },
    subtitle: {
      fontSize: 14,
      color: "white",
    },
    subtitle1: {
      fontSize: 14,
      color: "black",
      marginLeft: 16,
    },
    searchBar: {
      margin: 15,
      padding: 10,
      borderRadius: 8,
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#ddd",
    },
    loader: {
      marginTop: 30,
    },
    errorText: {
      fontSize: 16,
      color: "red",
      textAlign: "center",
      marginTop: 10,
    },
    noResults: {
      fontSize: 16,
      fontStyle: "italic",
      textAlign: "center",
      color: "gray",
      marginTop: 20,
    },
    card: {
      marginHorizontal: 15,
      marginVertical: 10,
      borderRadius: 10,
      elevation: 3,
    },
  });
  

  export default LocationSelection;