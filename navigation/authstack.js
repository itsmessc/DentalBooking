import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/login";
import Signup from "../screens/signup";

const stack = createStackNavigator();

const AuthStack = () => {
    return (
        <NavigationContainer>
            <stack.Navigator screenOptions={{ headerShown: false }}>
                <stack.Screen name="Login" component={Login} />
                <stack.Screen name="Signup" component={Signup} />
            </stack.Navigator>
        </NavigationContainer>
    );
}

export default AuthStack;