import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Card, Button, Avatar } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import Constants from "expo-constants";
// 📌 API Base URL
const API_URL = Constants.expoConfig.extra.API_URL;
const GEOAPIFY_API_KEY = Constants.expoConfig.extra.GEOAPIFY_API_KEY; // Replace with a valid Geoapify API key

const ServiceSelection = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedOffice } = route.params;

    const [hospitalDetails, setHospitalDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);

    // 📌 Fetch Hospital Details & Services
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`${API_URL}/dental-offices/${selectedOffice.id}`);
                const data = await response.json();
                setHospitalDetails(data);
            } catch (error) {
                console.error("Error fetching hospital details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, []);

    // 📌 Generate Geoapify Static Map URL
    const mapUrl = hospitalDetails
        ? `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=600&height=400&center=lonlat:${hospitalDetails.location.lng},${hospitalDetails.location.lat}&zoom=15&marker=lonlat:${hospitalDetails.location.lng},${hospitalDetails.location.lat};type:awesome;color:%23bb3f73;size:x-large&apiKey=${GEOAPIFY_API_KEY}`
        : "";

    // 📌 Select Service
    const selectService = (service) => {
        setSelectedService(service);
    };

    // 📌 Proceed to Booking
    const proceedToBooking = () => {
        if (selectedService) {
            navigation.navigate("Booking", { selectedOffice, selectedService });
        } else {
            alert("Please select a service to proceed.");
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : (
                <>
                    {/* 📌 Hospital Information */}
                    <Card style={styles.hospitalCard}>
                        <Card.Title
                            title={hospitalDetails?.name || "Loading..."}
                            titleNumberOfLines={2} // Allow multiple lines if needed
                            left={(props) => <Avatar.Icon {...props} icon="hospital-building" />}
                        />

                        {/* 📌 Hospital Details (Separate Content) */}
                        <Card.Content>
                            <Text style={styles.detailText}><Text style={styles.label}>Phone:</Text> {hospitalDetails?.contact || "Not Available"}</Text>
                            <Text style={styles.detailText}><Text style={styles.label}>Opening Hours:</Text> {hospitalDetails?.openingHours || "Not Available"}</Text>
                            <Text style={styles.detailText}><Text style={styles.label}>Specialties:</Text> {hospitalDetails?.specialties?.join(", ") || "Not Available"}</Text>
                        </Card.Content>

                        {/* 📌 Geoapify Static Map */}
                        {mapUrl ? (
                            <Image source={{ uri: mapUrl }} style={styles.mapImage} resizeMode="cover" />
                        ) : (
                            <Text style={styles.errorText}>Map not available</Text>
                        )}
                    </Card>


                    {/* 📌 Available Services */}
                    <Text style={styles.sectionTitle}>Available Services</Text>
                    <FlatList
                        data={hospitalDetails?.services || []}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => selectService(item)}>
                                <Card style={[styles.card, selectedService?.id === item.id && styles.selectedCard]}>
                                    <Card.Title title={item.name} />
                                    <Card.Content>
                                        <Text style={styles.description}>{item.description || "No description available."}</Text>
                                        <Text style={styles.price}>Price: ₹{item.price}</Text>
                                    </Card.Content>
                                </Card>
                            </TouchableOpacity>
                        )}
                    />

                    {/* 📌 Proceed Button */}
                    <Button mode="contained" onPress={proceedToBooking} style={styles.proceedButton}>
                        Proceed to Booking
                    </Button>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F5", padding: 10 },
    hospitalCard: { marginBottom: 15, borderRadius: 10 },
    mapImage: { width: "100%", height: 180, borderRadius: 10, marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
    card: {
        marginVertical: 5,
        padding: 10,
        borderRadius: 8,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    selectedCard: {
        borderColor: "#007AFF",
        borderWidth: 2,
    },
    description: { fontSize: 14, color: "#555" },
    price: { fontSize: 16, fontWeight: "bold", marginTop: 5 },
    proceedButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#007AFF",
    },
    errorText: {
        textAlign: "center",
        color: "red",
        fontSize: 16,
        marginTop: 10,
    },
});

export default ServiceSelection;
