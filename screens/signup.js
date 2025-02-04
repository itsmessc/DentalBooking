import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";

// Regex Patterns
const nameRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
const phoneRegex = /^[6-9]\d{9}$/; // Ensures a valid Indian mobile number (10 digits, starts with 6-9)

const Signup = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSignup = () => {
    if (!nameRegex.test(name)) {
      setError("Name must only contain letters.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Invalid email format.");
      return;
    }
    if (!phoneRegex.test(phone)) {
      setError("Phone number must be a valid 10-digit Indian number.");
      return;
    }
    if (!passwordRegex.test(password)) {
      setError("Password must contain at least 6 characters, including letters and numbers.");
      return;
    }

    // Dispatch action to Redux store
    dispatch(login({ user: { name, email, phone }, token: "dummy_token" }));
    setError(null);
    console.log("Signup successful");

    // Navigate to Login after signup
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account 🦷</Text>

      <TextInput
        label="Full Name"
        mode="outlined"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Email"
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        label="Phone Number"
        mode="outlined"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry={!passwordVisible}
        value={password}
        onChangeText={setPassword}
        right={<TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} onPress={() => setPasswordVisible(!passwordVisible)} />}
        style={styles.input}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button mode="contained" onPress={handleSignup} style={styles.button}>
        Sign Up
      </Button>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { marginBottom: 10 },
  button: { marginTop: 10 },
  linkText: { textAlign: "center", marginTop: 10, color: "blue" },
  errorText: { color: "red", fontSize: 12, marginBottom: 5 },
});

export default Signup;
