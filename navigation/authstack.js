import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/login";
import Signup from "../screens/signup";
import Dashboard from "../screens/dashboard";
import LocationSelection from "../screens/locationselection";

const stack = createStackNavigator();

const AuthStack = () => {
    return (
        <NavigationContainer>
            <stack.Navigator screenOptions={{ headerShown: false }}>
                <stack.Screen name="Login" component={Login} />
                <stack.Screen name="Signup" component={Signup} />
                <stack.Screen name="Dashboard" component={Dashboard} />
                <stack.Screen name="LocationSelection" component={LocationSelection} />
            </stack.Navigator>
        </NavigationContainer>
    );
}

export default AuthStack;