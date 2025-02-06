import React, { useEffect } from "react";
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Card, Avatar, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchDentists, setSelectedDentist } from "../redux/bookingSlice";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.API_URL;

const DentistSelection = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    // Get Redux state
    const { selectedService, selectedOffice, dentists, isLoading, selectedDentist } = useSelector((state) => state.booking);

    // Fetch dentists based on selected service and office
    useEffect(() => {
        if (selectedService && selectedOffice) {
            dispatch(fetchDentists({ officeId: selectedOffice.id, serviceId: selectedService.name })); // Service name used
        }
    }, [selectedService, selectedOffice]);

    // Select Dentist
    const selectDentist = (dentist) => {
        dispatch(setSelectedDentist(dentist));
    };

    // Proceed to Booking
    const proceedToBooking = () => {
        if (selectedDentist) {
            navigation.navigate("DateTimeSelection"); // Navigate to date/time selection
        } else {
            alert("Please select a dentist to proceed.");
        }
    };

    return (
        <View style={styles.container}>
            {isLoading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : dentists.length === 0 ? (
                <Text style={styles.noResults}>No dentists available for this service.</Text>
            ) : (
                <>
                    <Text style={styles.header}>Available Dentists for {selectedService?.name}</Text>
                    <FlatList
                        data={dentists}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => selectDentist(item)}>
                                <Card style={[styles.card, selectedDentist?.id === item.id && styles.selectedCard]}>
                                    <Card.Title
                                        title={item.name}
                                        subtitle={`⭐ ${item.rating} / 5 \n${item.specialties.join(", ")}`}
                                        left={(props) => <Avatar.Image {...props} source={{ uri: item.photo }} />}
                                        subtitleNumberOfLines={3}
                                    />
                                </Card>
                            </TouchableOpacity>
                        )}
                    />
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
    header: { fontSize: 18, fontWeight: "bold", marginVertical: 10, textAlign: "center" },
    card: { marginVertical: 5, padding: 10, borderRadius: 8, backgroundColor: "white", borderWidth: 1, borderColor: "#ddd" },
    selectedCard: { borderColor: "#007AFF", borderWidth: 2 },
    noResults: { textAlign: "center", fontSize: 16, color: "gray", marginTop: 20 },
    proceedButton: { marginTop: 10, padding: 10, backgroundColor: "#007AFF" },
});

export default DentistSelection;
