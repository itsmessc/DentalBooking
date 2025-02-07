import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons"; // Import an icon

const SplashScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0); // Initial opacity value

  useEffect(() => {
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500, // 1.5 seconds fade-in
      useNativeDriver: true,
    }).start();

    // Check for stored token
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      setTimeout(() => {
        if (token) {
          navigation.replace("Dashboard"); // Navigate to Dashboard if token exists
        } else {
          navigation.replace("Login"); // Navigate to Login if no token
        }
      }, 2500); // 2.5 seconds delay
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      {/* Fade-in Animation */}
      <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
        <MaterialIcons name="health-and-safety" size={80} color="white" />
        <Text style={styles.appName}>Dental Booking App</Text>
        <Text style={styles.tagline}>Your Trusted Booking Partner</Text>
        <ActivityIndicator size="large" color="white" style={styles.loader} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007AFF", // Change to match your app theme
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
    marginTop: 5,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
