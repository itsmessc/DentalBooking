import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Card, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDate, setSelectedTime } from "../redux/bookingSlice";
import CalendarPicker from "react-native-calendar-picker";
import moment from "moment";

const DateTimeSelection = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    // Get Redux state
    const { selectedDentist, selectedOffice, selectedDate, selectedTime } = useSelector((state) => state.booking);
    
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    // Generate available time slots based on opening hours
    useEffect(() => {
        if (!selectedDentist || !selectedOffice) return;

        const officeHours = selectedOffice.openingHours[moment(selectedDate).format("dddd")]; // Get opening hours for the selected day
        if (!officeHours || officeHours === "Closed") {
            setAvailableSlots([]);
            return;
        }

        const [start, end] = officeHours.split(" - ");
        const openingTime = moment(start, "hh:mm A");
        const closingTime = moment(end, "hh:mm A");
        const interval = 30; // 30-minute slots

        let slots = [];
        while (openingTime.isBefore(closingTime)) {
            slots.push(openingTime.format("hh:mm A"));
            openingTime.add(interval, "minutes");
        }

        // Filter out unavailable slots
        const unavailableSlots = selectedDentist.unavailableSlots?.find(
            (slot) => slot.date === moment(selectedDate).format("YYYY-MM-DD")
        )?.times || [];

        const filteredSlots = slots.filter((slot) => !unavailableSlots.includes(slot));

        setAvailableSlots(filteredSlots);
    }, [selectedDate, selectedDentist]);

    // Handle date selection
    const handleDateChange = (date) => {
        dispatch(setSelectedDate(moment(date).format("YYYY-MM-DD")));
    };

    // Handle time slot selection
    const handleTimeSelection = (time) => {
        dispatch(setSelectedTime(time));
    };

    // Proceed to final confirmation
    const proceedToConfirmation = () => {
        if (!selectedDate || !selectedTime) {
            alert("Please select both date and time.");
            return;
        }
        navigation.navigate("ConfirmationScreen"); // Navigate to final step
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Pick a Date</Text>
            <CalendarPicker
                onDateChange={handleDateChange}
                minDate={new Date()}
                selectedStartDate={selectedDate}
                textStyle={{ color: "#000" }}
            />

            <Text style={styles.header}>Available Time Slots</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : availableSlots.length === 0 ? (
                <Text style={styles.noSlots}>No available slots for this day.</Text>
            ) : (
                <FlatList
                    data={availableSlots}
                    keyExtractor={(item) => item}
                    numColumns={3}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleTimeSelection(item)}>
                            <Card style={[styles.timeSlot, selectedTime === item && styles.selectedSlot]}>
                                <Text style={styles.slotText}>{item}</Text>
                            </Card>
                        </TouchableOpacity>
                    )}
                />
            )}

            <Button mode="contained" onPress={proceedToConfirmation} style={styles.proceedButton}>
                Proceed to Confirmation
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F5", padding: 10 },
    header: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
    noSlots: { fontSize: 16, textAlign: "center", color: "gray", marginTop: 10 },
    timeSlot: {
        padding: 15,
        margin: 5,
        borderRadius: 5,
        backgroundColor: "#E3E3E3",
        alignItems: "center",
    },
    selectedSlot: {
        backgroundColor: "#007AFF",
    },
    slotText: { fontSize: 14, color: "#000" },
    proceedButton: { marginTop: 10, padding: 10, backgroundColor: "#007AFF" },
});

export default DateTimeSelection;
