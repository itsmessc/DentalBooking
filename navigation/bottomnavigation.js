import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Dashboard from "../screens/dashboard"; 
import AllAppointments from "../screens/appointments";

const BottomNav = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Define tab items
  const tabs = [
    { key: "dashboard", title: "Dashboard", icon: "home-outline" },
    { key: "appointments", title: "Appointments", icon: "calendar-outline" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "appointments" && <AllAppointments />}
      </View>

      {/* Custom Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon
              name={tab.icon}
              size={28}
              color={activeTab === tab.key ? "#007AFF" : "#888"} // Change color dynamically
            />
            <Text
              style={[
                styles.label,
                { color: activeTab === tab.key ? "#007AFF" : "#888" },
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  content: { flex: 1 },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingVertical: 10,
  },
  tab: { alignItems: "center", flex: 1 },
  label: { fontSize: 12, marginTop: 3 },
});

export default BottomNav;
