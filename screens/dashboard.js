import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigation } from "@react-navigation/native";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace("Login"); // Redirect to Login after logout
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name || "User"} 👋</Text>
      <Text style={styles.subtitle}>You are successfully logged in.</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "gray", marginBottom: 20 },
  button: { backgroundColor: "red", padding: 12, borderRadius: 5 },
  buttonText: { color: "white", fontSize: 16 },
});

export default Dashboard;
