import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { LoginScreen } from "../screens/auth/LoginScreen";
import VerifyEmailScreen from "../screens/auth/VerifyEmailScreen";
import { ChangePasswordScreen } from "../screens/settings/ChangePasswordScreen";

const Stack = createNativeStackNavigator();

export const AuthNavigator: React.FC = () => {
  return (
    // @ts-ignore - Stack.Navigator does have children, this is a TypeScript false positive
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
};
