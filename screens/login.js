import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native"; // ✅ Fix: Prevent Multiple Calls

// Regex for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

const Login = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validationError, setValidationError] = useState("");

    // ✅ Fix: Prevent multiple calls using `useFocusEffect`
    useFocusEffect(
        useCallback(() => {
            const checkToken = async () => {
                const token = await AsyncStorage.getItem("token");
                console.log("Retrieved Token:", token);

                if (token) {
                    navigation.replace("Dashboard");
                }
            };

            checkToken();
        }, [])
    );

    const handleLogin = () => {
        setValidationError("");

        // Validate email format
        if (!emailRegex.test(email)) {
            setValidationError("Invalid email format.");
            return;
        }

        // Validate password format
        if (!passwordRegex.test(password)) {
            setValidationError("Password must be at least 6 characters long and include letters and numbers.");
            return;
        }

        // Dispatch login action if validation passes
        dispatch(loginUser(email, password, navigation));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back! 👋</Text>
            <TextInput
                label="Email"
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                label="Password"
                mode="outlined"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />

            {/* Show validation errors */}
            {validationError ? <Text style={styles.errorText}>{validationError}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {loading ? (
                <ActivityIndicator size="large" color="blue" />
            ) : (
                <Button mode="contained" onPress={handleLogin} style={styles.button}>
                    Login
                </Button>
            )}

            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.linkText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
    input: { width: "100%", marginBottom: 10 },
    button: { marginTop: 10, width: "100%" },
    linkText: { textAlign: "center", marginTop: 10, color: "blue" },
    errorText: { color: "red", fontSize: 12, marginBottom: 5 },
});

export default Login;
