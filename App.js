import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import store from "./redux/store";
import { loadUserSession } from "./redux/authSlice";
import AuthStack from "./navigation/authstack";
import { PaperProvider  , DefaultTheme } from "react-native-paper";

const theme={
  ...DefaultTheme,
  primary: "#007AFF", // Blue theme color
  background: "#FFFFFF", 
}

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserSession()); // Load user data from AsyncStorage when app starts
  }, [dispatch]);

  return <AuthStack />;
};

export default () => (
  <Provider store={store}>
    <PaperProvider theme={theme}>
    <App />
    </PaperProvider>
  </Provider>
);
