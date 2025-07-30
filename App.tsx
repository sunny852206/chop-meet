import AppNavigator from "./navigation/AppNavigator";
import Toast from "react-native-toast-message";

import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <>
      <AppNavigator />
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
