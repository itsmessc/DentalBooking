import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../redux/authSlice";

// Regex for validation
const nameRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/; // Valid 10-digit Indian mobile number
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

const Signup = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSignup = () => {
    setValidationError("");

    // Validate Name
    if (!nameRegex.test(name)) {
      setValidationError("Name must only contain letters and spaces.");
      return;
    }

    // Validate Email
    if (!emailRegex.test(email)) {
      setValidationError("Invalid email format.");
      return;
    }

    // Validate Phone Number
    if (!phoneRegex.test(phone)) {
      setValidationError("Phone number must be a valid 10-digit Indian number.");
      return;
    }

    // Validate Password
    if (!passwordRegex.test(password)) {
      setValidationError("Password must be at least 6 characters long and include letters & numbers.");
      return;
    }

    // Dispatch signup action if validation passes
    dispatch(signupUser(name, email, phone, password, navigation));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account 🦷</Text>

      <TextInput label="Full Name" mode="outlined" value={name} onChangeText={setName} style={styles.input} />
      <TextInput label="Email" mode="outlined" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
      <TextInput label="Phone" mode="outlined" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <TextInput label="Password" mode="outlined" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />

      {/* Show validation errors */}
      {validationError ? <Text style={styles.errorText}>{validationError}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <Button mode="contained" onPress={handleSignup} style={styles.button}>
          Sign Up
        </Button>
      )}

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
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

export default Signup;
