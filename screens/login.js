import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, ScrollView } from "react-native";
import { TextInput, Button, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

// Regex for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

const Login = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [validationError, setValidationError] = useState("");

    useFocusEffect(
        useCallback(() => {
            const checkToken = async () => {
                const token = await AsyncStorage.getItem("token");
                if (token) {
                    navigation.replace("BottomNavigation");
                }
            };
            checkToken();
        }, [])
    );

    const handleLogin = () => {
        setValidationError("");

        if (!emailRegex.test(email)) {
            setValidationError("Invalid email format.");
            return;
        }
        if (!passwordRegex.test(password)) {
            setValidationError("Password must contain letters and numbers, and be at least 6 characters long.");
            return;
        }

        dispatch(loginUser(email, password, navigation));
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Welcome Back!</Text>
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
                    label="Password"
                    mode="outlined"
                    secureTextEntry={!passwordVisible}
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    right={
                        <TextInput.Icon 
                            icon={passwordVisible ? "eye-off" : "eye"} 
                            onPress={() => setPasswordVisible(!passwordVisible)} 
                        />
                    }
                    theme={{ colors: { primary: "#007AFF" } }}

                />

                {validationError ? <Text style={styles.errorText}>{validationError}</Text> : null}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {loading ? (
                    <ActivityIndicator size="large" color="#007AFF" />
                ) : (
                    <Button mode="contained" onPress={handleLogin} style={styles.button} labelStyle={styles.buttonText}>
                        Login
                    </Button>
                )}

                <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={styles.linkContainer}>
                    <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkHighlight}>Sign up</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F5" },
    scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 25, paddingVertical: 50 },
    title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 20 },
    input: { width: "100%", marginBottom: 15 },
    button: { marginTop: 20, width: "100%", backgroundColor: "#007AFF", borderRadius: 10 },
    buttonText: { fontSize: 16, fontWeight: "bold" },
    linkContainer: { marginTop: 20 },
    linkText: { fontSize: 14, color: "#666" },
    linkHighlight: { color: "#007AFF", fontWeight: "bold" },
    errorText: { color: "red", fontSize: 14, marginBottom: 5, textAlign: "center" },
});

export default Login;
