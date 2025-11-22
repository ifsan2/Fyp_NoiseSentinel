import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { CreateChallanScreen } from "../screens/challan/CreateChallanScreen";
import { MyChallansScreen } from "../screens/challan/MyChallansScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { GlassTabBar } from "../components/navigation/GlassTabBar";

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute", // Required for the transparent background effect
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: "Home" }}
      />
      <Tab.Screen 
        name="History" 
        component={MyChallansScreen} 
        options={{ title: "History" }}
      />
      <Tab.Screen 
        name="Scan" 
        component={CreateChallanScreen} 
        options={{ title: "Scan" }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};
