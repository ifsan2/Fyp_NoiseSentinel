import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { View } from "react-native";
import { Loading } from "../components/common/Loading";
import { useAuth } from "../contexts/AuthContext";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { ChangePasswordScreen } from "../screens/settings/ChangePasswordScreen";

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <Loading message="Loading..." fullScreen />
      </View>
    );
  }

  return (
    // @ts-ignore - NavigationContainer does have children, this is a TypeScript false positive
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.mustChangePassword ? (
        // ✅ Force user to change password before accessing main app
        // @ts-ignore
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="ForcedChangePassword"
            component={ChangePasswordScreen}
            initialParams={{ fromLogin: true }}
          />
        </Stack.Navigator>
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
};
