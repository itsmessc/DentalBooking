import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/login";
import Signup from "../screens/signup";
import Dashboard from "../screens/dashboard";
import LocationSelection from "../screens/locationselection";
import ServiceSelection from "../screens/serviceselection";
import DentistSelection from "../screens/dentistselection";
import DateTimeSelection from "../screens/datetimeselection";
import ConfirmationScreen from "../screens/conformandpay";
import SuccessScreen from "../screens/successscreen";
import SplashScreen from "../screens/splashscreen";

const stack = createStackNavigator();

const AuthStack = () => {
    return (
        <NavigationContainer>
            <stack.Navigator screenOptions={{ headerShown: false }}>
                <stack.Screen name="SplashScreen" component={SplashScreen} />
                <stack.Screen name="Login" component={Login} />
                <stack.Screen name="Signup" component={Signup} />
                <stack.Screen name="Dashboard" component={Dashboard} />
                <stack.Screen name="LocationSelection" component={LocationSelection} />
                <stack.Screen name="ServiceSelection" component={ServiceSelection} />
                <stack.Screen name="DentistSelection" component={DentistSelection} />
                <stack.Screen name="DateTimeSelection" component={DateTimeSelection} />
                <stack.Screen name="ConfirmationScreen" component={ConfirmationScreen} />
                <stack.Screen name="SuccessScreen" component={SuccessScreen} />
                
            </stack.Navigator>
        </NavigationContainer>
    );
}

export default AuthStack;