import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ChallanDetailScreen } from "../screens/challan/ChallanDetailScreen";
import { CreateChallanScreen } from "../screens/challan/CreateChallanScreen";
import { MyChallansScreen } from "../screens/challan/MyChallansScreen";
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { PairDeviceScreen } from "../screens/device/PairDeviceScreen";
import { CreateEmissionReportScreen } from "../screens/emissionReport/CreateEmissionReportScreen";
import { SearchAccusedScreen } from "../screens/search/SearchAccusedScreen";
import { SearchVehicleScreen } from "../screens/search/SearchVehicleScreen";
import { ViolationsScreen } from "../screens/search/ViolationsScreen";
import { ChangePasswordScreen } from "../screens/settings/ChangePasswordScreen";
import { TabNavigator } from "./TabNavigator";

const Stack = createNativeStackNavigator();

export const MainNavigator: React.FC = () => {
  return (
    // @ts-ignore - Stack.Navigator does have children, this is a TypeScript false positive
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="PairDevice" component={PairDeviceScreen} />
      <Stack.Screen
        name="CreateEmissionReport"
        component={CreateEmissionReportScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      {/* Kept in stack for direct access if needed, but primarily in tabs now */}
      <Stack.Screen 
        name="CreateChallan" 
        component={CreateChallanScreen} 
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="MyChallans" component={MyChallansScreen} />
      
      <Stack.Screen name="ChallanDetail" component={ChallanDetailScreen} />
      <Stack.Screen name="SearchVehicle" component={SearchVehicleScreen} />
      <Stack.Screen name="SearchAccused" component={SearchAccusedScreen} />
      <Stack.Screen name="Violations" component={ViolationsScreen} />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
};

