import React, { useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Card, Avatar, Button } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { clearDateandTime, fetchDentists, setSelectedDentist } from "../redux/bookingSlice";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.API_URL;

const DentistSelection = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
        return () => {
            dispatch(clearDateandTime(null));
        };
    }, [])
    );

  // Get Redux state
  const { selectedService, selectedOffice, dentists, isLoading, selectedDentist } = useSelector((state) => state.booking);

  // Fetch dentists based on selected service and office
  useEffect(() => {
    if (selectedService && selectedOffice) {
      dispatch(fetchDentists({ officeId: selectedOffice.id, serviceId: selectedService.id }));
    }
  }, [selectedService, selectedOffice]);

  // Select Dentist
  const selectDentist = (dentist) => {
    dispatch(setSelectedDentist(dentist));
  };

  // Proceed to Booking
  const proceedToBooking = () => {
    if (selectedDentist) {
      navigation.navigate("DateTimeSelection");
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
          {/* Header */}
          <Text style={styles.header}>Available Dentists for {selectedService?.name}</Text>

          {/* Dentists List */}
          <FlatList
            data={dentists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => selectDentist(item)}>
                <Card style={[styles.card, selectedDentist?.id === item.id && styles.selectedCard]}>
                  <View style={styles.cardContent}>
                    {/* Dentist Image */}
                    {item.photo ? (
                      <Avatar.Image size={70} source={{ uri: item.photo }} style={styles.avatar} />
                    ) : (
                      <Avatar.Icon size={70} icon="account" style={styles.defaultAvatar} />
                    )}

                    {/* Dentist Info */}
                    <View style={styles.textContainer}>
                      <Text style={styles.dentistName}>{item.name}</Text>
                      <Text style={styles.rating}>⭐ {item.rating} / 5</Text>
                      <Text style={styles.specialties}>{item.specialties.join(", ")}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {/* Fixed Proceed Button */}
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={proceedToBooking} style={styles.proceedButton}>
          Proceed to Booking
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  // Header
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
    color: "#333",
  },

  // List Container
  listContainer: {
    paddingBottom: 80, // Prevents content from getting cut off by button
  },

  // Dentist Cards
  card: {
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
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

  // Card Layout Fixes
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  avatar: {
    marginRight: 15,
  },
  defaultAvatar: {
    backgroundColor: "#D3D3D3", // Light Gray (No More Purple)
  },
  textContainer: {
    flex: 1,
  },
  dentistName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  rating: {
    fontSize: 14,
    color: "#007AFF",
    marginVertical: 2,
  },
  specialties: {
    fontSize: 14,
    color: "#666",
  },

  // No Results Message
  noResults: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    marginTop: 20,
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
});

export default DentistSelection;
