import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { Card, Button, Modal, Portal } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { confirmAppointment, setPaymentStatus, setAppointmentDetails } from "../redux/bookingSlice";

const ConfirmationScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    // Get Redux state  
    const { selectedOffice, selectedService, selectedDentist, selectedDate, selectedTime, hospitalDetails } = useSelector((state) => state.booking);
    
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false); // Payment Modal Visibility

    // Check if all details are present
    if (!selectedOffice || !selectedService || !selectedDentist || !selectedDate || !selectedTime) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Missing appointment details. Please complete all steps.</Text>
            </View>
        );
    }

    // Open mock payment modal
    const handleOpenPayment = () => {
        setVisible(true);
    };

    // Handle mock payment confirmation
    const handleConfirmPayment = async () => {
        setLoading(true);
        const appointmentData = {
            officeId: selectedOffice.id,
            officeName: selectedOffice.name,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            servicePrice: selectedService.price,
            dentistId: selectedDentist.id,
            dentistName: selectedDentist.name,
            date: selectedDate,
            time: selectedTime,
            status: "Confirmed",
            paymentStatus: "Paid",
            userId: user.id,
            location: hospitalDetails.location,
        };

        try {
            console.log("Booking Appointment with data:", appointmentData);
            const response = await dispatch(confirmAppointment(appointmentData)).unwrap();
            console.log("Appointment successfully booked:", response);

            dispatch(setPaymentStatus("completed")); // Update payment status
            dispatch(setAppointmentDetails(appointmentData));
            Alert.alert("Success", "Your appointment has been confirmed!");
            navigation.navigate("SuccessScreen");
        } catch (error) {
            Alert.alert("Error", "Failed to confirm appointment. Please try again.");
            console.error("Error during appointment confirmation:", error);
        } finally {
            setLoading(false);
            setVisible(false); // Close modal
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Review & Pay</Text>

            {/* Appointment Details */}
            <Card style={styles.infoCard}>
                <Card.Content>
                    <View style={styles.row}>
                        <Text style={styles.label}>Location:</Text>
                        <Text style={styles.value}>{selectedOffice?.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Service:</Text>
                        <Text style={styles.value}>{selectedService?.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Dentist:</Text>
                        <Text style={styles.value}>{selectedDentist?.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date:</Text>
                        <Text style={styles.value}>{selectedDate}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Time:</Text>
                        <Text style={styles.value}>{selectedTime}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Total:</Text>
                        <Text style={styles.amount}>₹{selectedService?.price || "N/A"}</Text>
                    </View>
                </Card.Content>
            </Card>

            {/* Confirm & Pay Button */}
            <View style={styles.buttonContainer}>
                <Button mode="contained" onPress={handleOpenPayment} style={styles.payButton}>
                    Confirm & Pay
                </Button>
            </View>

            {/* Mock Payment Modal (Stripe-like UI) */}
            <Portal>
                <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
                    <Text style={styles.modalTitle}>Secure Payment</Text>
                    <Text style={styles.modalText}>Total Amount: ₹{selectedService?.price}</Text>

                    {/* Mock Payment UI */}
                    <View style={styles.paymentBox}>
                        <Text style={styles.paymentMethod}>💳 Credit / Debit Card</Text>
                        <Text style={styles.paymentDetails}>**** **** **** 4242</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#007AFF" />
                    ) : (
                        <TouchableOpacity style={styles.payNowButton} onPress={handleConfirmPayment}>
                            <Text style={styles.payNowButtonText}>Pay Now</Text>
                        </TouchableOpacity>
                    )}
                </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        padding: 20,
        justifyContent: "center",
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    errorText: {
        fontSize: 18,
        color: "red",
        textAlign: "center",
    },
    infoCard: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        elevation: 3,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    value: {
        fontSize: 16,
        color: "#555",
    },
    amount: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#007AFF",
    },

    // Button
    buttonContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        padding: 10,
        elevation: 5,
    },
    payButton: {
        padding: 12,
        backgroundColor: "#007AFF",
        borderRadius: 10,
    },

    // Modal
    modal: {
        backgroundColor: "white",
        padding: 20,
        margin: 30,
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
    },

    // Stripe-like Payment UI
    paymentBox: {
        width: "100%",
        backgroundColor: "#F2F2F2",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    paymentMethod: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    paymentDetails: {
        fontSize: 16,
        color: "#555",
    },

    payNowButton: {
        backgroundColor: "#28A745",
        padding: 12,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    payNowButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
});

export default ConfirmationScreen;
