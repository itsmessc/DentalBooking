import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, ScrollView } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../redux/authSlice";

// Regex for validation
const nameRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

const Signup = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [validationError, setValidationError] = useState("");

    const handleSignup = () => {
        setValidationError("");

        if (!nameRegex.test(name)) {
            setValidationError("Name must only contain letters and spaces.");
            return;
        }
        if (!emailRegex.test(email)) {
            setValidationError("Invalid email format.");
            return;
        }
        if (!phoneRegex.test(phone)) {
            setValidationError("Phone number must be a valid 10-digit Indian number.");
            return;
        }
        if (!passwordRegex.test(password)) {
            setValidationError("Password must contain letters and numbers, and be at least 6 characters long.");
            return;
        }

        dispatch(signupUser(name, email, phone, password, navigation));
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Create Account 🦷</Text>

                <TextInput 
                    label="Full Name" 
                    mode="outlined" 
                    value={name} 
                    onChangeText={setName} 
                    style={styles.input} 
                    theme={{ colors: { primary: "#007AFF" } }} 
                />
                <TextInput 
                    label="Email" 
                    mode="outlined" 
                    value={email} 
                    onChangeText={setEmail} 
                    style={styles.input} 
                    keyboardType="email-address" 
                    autoCapitalize="none" 
                    theme={{ colors: { primary: "#007AFF" } }} 
                />
                <TextInput 
                    label="Phone" 
                    mode="outlined" 
                    value={phone} 
                    onChangeText={setPhone} 
                    style={styles.input} 
                    keyboardType="phone-pad" 
                    theme={{ colors: { primary: "#007AFF" } }} 
                />
                <TextInput 
                    label="Password" 
                    mode="outlined" 
                    secureTextEntry={!passwordVisible} 
                    value={password} 
                    onChangeText={setPassword} 
                    style={styles.input} 
                    theme={{ colors: { primary: "#007AFF" } }} 
                    right={<TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} onPress={() => setPasswordVisible(!passwordVisible)} />}
                />

                {validationError ? <Text style={styles.errorText}>{validationError}</Text> : null}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {loading ? (
                    <ActivityIndicator size="large" color="#007AFF" />
                ) : (
                    <Button mode="contained" onPress={handleSignup} style={styles.button} labelStyle={styles.buttonText}>
                        Sign Up
                    </Button>
                )}

                <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.linkContainer}>
                    <Text style={styles.linkText}>Already have an account? <Text style={styles.linkHighlight}>Login</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

// ✅ Styles for Signup Screen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 25,
        paddingVertical: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    input: {
        width: "100%",
        marginBottom: 15,
        backgroundColor: "#fff",
        borderRadius: 10,
    },
    button: {
        marginTop: 20,
        width: "100%",
        backgroundColor: "#007AFF",
        borderRadius: 10,
        paddingVertical: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    linkContainer: {
        marginTop: 20,
    },
    linkText: {
        fontSize: 14,
        color: "#666",
    },
    linkHighlight: {
        color: "#007AFF",
        fontWeight: "bold",
    },
    errorText: {
        color: "red",
        fontSize: 14,
        marginBottom: 5,
        textAlign: "center",
    },
});

export default Signup;
