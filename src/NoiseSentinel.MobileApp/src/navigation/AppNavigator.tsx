import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { Loading } from "../components/common/Loading";
import { useAuth } from "../contexts/AuthContext";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

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
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

