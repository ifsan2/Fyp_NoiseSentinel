import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { LoginScreen } from "../screens/auth/LoginScreen";

const Stack = createNativeStackNavigator();

export const AuthNavigator: React.FC = () => {
  return (
    // @ts-ignore - Stack.Navigator does have children, this is a TypeScript false positive
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};
