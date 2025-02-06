import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Card, Button, Modal, Portal } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { confirmAppointment, setPaymentStatus } from "../redux/bookingSlice";

const ConfirmationScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    // Get Redux state
    const { selectedOffice, selectedService, selectedDentist, selectedDate, selectedTime } = useSelector((state) => state.booking);

    // State for mock payment
    const [visible, setVisible] = useState(false);

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
        setVisible(false); // Close modal

        const appointmentData = {
            officeId: selectedOffice.id,
            officeName: selectedOffice.name,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            servicePrice: selectedService.price, // Store price
            dentistId: selectedDentist.id,
            dentistName: selectedDentist.name,
            date: selectedDate,
            time: selectedTime,
            status: "Confirmed",
            paymentStatus: "Paid",
        };

        try {
            await dispatch(confirmAppointment(appointmentData)).unwrap();
            dispatch(setPaymentStatus("completed")); // Update payment status
            Alert.alert("Success", "Your appointment has been confirmed!");
            navigation.navigate("SuccessScreen"); // Navigate to success screen
        } catch (error) {
            Alert.alert("Error", "Failed to confirm appointment. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Review & Pay</Text>

            {/* Appointment Details */}
            <Card style={styles.infoCard}>
                <Card.Content>
                    <Text style={styles.label}>Location:</Text>
                    <Text style={styles.value}>{selectedOffice?.name}</Text>

                    <Text style={styles.label}>Service:</Text>
                    <Text style={styles.value}>{selectedService?.name}</Text>

                    <Text style={styles.label}>Dentist:</Text>
                    <Text style={styles.value}>{selectedDentist?.name}</Text>

                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>{selectedDate}</Text>

                    <Text style={styles.label}>Time:</Text>
                    <Text style={styles.value}>{selectedTime}</Text>

                    <Text style={styles.label}>Total Amount:</Text>
                    <Text style={styles.amount}>₹{selectedService?.price || "N/A"}</Text>
                </Card.Content>
            </Card>

            {/* Confirm & Pay Button */}
            <Button mode="contained" onPress={handleOpenPayment} style={styles.payButton}>
                Confirm & Pay
            </Button>

            {/* Mock Payment Modal */}
            <Portal>
                <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
                    <Text style={styles.modalTitle}>Mock Payment Gateway</Text>
                    <Text style={styles.modalText}>Total Amount: ₹{selectedService?.price}</Text>

                    <TouchableOpacity style={styles.payNowButton} onPress={handleConfirmPayment}>
                        <Text style={styles.payNowButtonText}>Pay Now</Text>
                    </TouchableOpacity>
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
        fontWeight: "600",
        marginBottom: 20,
        textAlign: "center",
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
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
    },
    value: {
        fontSize: 16,
        color: "#555",
    },
    amount: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#007AFF",
        marginTop: 5,
    },
    payButton: {
        marginTop: 20,
        padding: 12,
        backgroundColor: "#007AFF",
        borderRadius: 10,
    },
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
