import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
  Dimensions,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, Clock, FileText, User } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors } from "../../styles/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Clean, Professional Tab Bar
// Simple, functional design for traffic police app

export const GlassTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  const getIconForRoute = (routeName: string) => {
    switch (routeName) {
      case "Dashboard":
        return Home;
      case "History":
        return Clock;
      case "Scan":
        return FileText;
      case "Profile":
        return User;
      default:
        return Home;
    }
  };

  const handlePress = (route: any, isFocused: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const Icon = getIconForRoute(route.name);

          const label =
            route.name === "Scan" ? "New Challan" : options.title || route.name;

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={() => handlePress(route, isFocused)}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  isFocused && styles.iconContainerFocused,
                ]}
              >
                <Icon
                  size={22}
                  color={isFocused ? colors.primary[600] : colors.neutral[400]}
                  strokeWidth={isFocused ? 2.5 : 2}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused
                      ? colors.primary[600]
                      : colors.neutral[400],
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
      },
    }),
  },
  tabBar: {
    flexDirection: "row",
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconContainer: {
    width: 44,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  iconContainerFocused: {
    backgroundColor: colors.primary[50],
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
  },
});
