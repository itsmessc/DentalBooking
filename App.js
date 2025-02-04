import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import store from './redux/store';
import AuthStack from './navigation/authstack';
import ScreenStacks from './navigation/screenstack';
export default function App() {
  return (
    <Provider store={store}>
      <AuthStack />
    </Provider>
  );
}

