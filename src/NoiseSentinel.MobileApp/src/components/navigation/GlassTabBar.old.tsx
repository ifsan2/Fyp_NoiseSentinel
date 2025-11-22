import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform, Text, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export const GlassTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={45} tint="light" style={styles.glassContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          // Icon mapping based on route name
          let iconName: keyof typeof Feather.glyphMap = "circle";
          if (route.name === "Dashboard") iconName = "grid";
          if (route.name === "Scan") iconName = "maximize"; // Or 'camera'
          if (route.name === "History") iconName = "clock"; // Or 'file-text'
          if (route.name === "Profile") iconName = "user";

          // Special styling for the middle "Scan" button
          const isMainAction = route.name === "Scan";

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabButton,
                isMainAction && styles.mainActionButton,
              ]}
            >
              <View style={[
                styles.iconContainer,
                isMainAction && styles.mainActionIconContainer,
                isFocused && !isMainAction && styles.focusedIconContainer
              ]}>
                <Feather
                  name={iconName}
                  size={isMainAction ? 28 : 24}
                  color={
                    isMainAction
                      ? colors.white
                      : isFocused
                      ? colors.primary[500]
                      : colors.neutral[400]
                  }
                />
              </View>
              {!isMainAction && (
                <Text
                  style={[
                    styles.label,
                    { color: isFocused ? colors.primary[500] : colors.neutral[400] },
                  ]}
                >
                  {options.title || route.name}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    pointerEvents: "box-none", // Allow touches to pass through empty spaces if needed
  },
  glassContainer: {
    flexDirection: "row",
    width: width - 32, // Floating effect with margin
    height: 70,
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Allow blur to shine through
    borderRadius: 24,
    marginBottom: 20, // Float from bottom
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  mainActionButton: {
    top: -20, // Float above the bar
    height: 70,
    width: 70,
    flex: 0, // Don't flex, fixed size
    justifyContent: "flex-start",
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  focusedIconContainer: {
    backgroundColor: colors.primary[50],
  },
  mainActionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[500],
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: colors.white, // Ring effect
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
  },
});
