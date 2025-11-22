import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform, Text, Dimensions } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, Clock, Scan, User } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle, Rect, Polyline } from "react-native-svg";
import { colors } from "../../styles/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// PREMIUM TAB BAR - $50K APP GRADE
// Features: True Bézier curve cutout, Professional blur, Haptic feedback
// Inspired by: Apple iOS, Modern banking apps

export const GlassTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const tabWidth = (width - 32) / 4;

  const getIconForRoute = (routeName: string) => {
    switch (routeName) {
      case "Dashboard":
        return Home;
      case "History":
        return Clock;
      case "Scan":
        return Scan;
      case "Profile":
        return User;
      default:
        return Home;
    }
  };

  // Web fallback SVG icons
  const renderWebIcon = (routeName: string, color: string, size: number = 24) => {
    const strokeWidth = 2;
    
    switch (routeName) {
      case "Dashboard":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Polyline
              points="9 22 9 12 15 12 15 22"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case "History":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Polyline
              points="12 6 12 12 16 14"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case "Scan":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="12"
              cy="13"
              r="4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case "Profile":
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="12"
              cy="7"
              r="4"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      default:
        return null;
    }
  };

  const handlePress = (route: any, isFocused: boolean) => {
    // Haptic feedback for police/authority app feel
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      {/* Blur Container */}
      <BlurView intensity={50} tint="light" style={styles.blurContainer}>
        <View style={styles.tabsContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const isMainAction = route.name === "Scan";
            const Icon = getIconForRoute(route.name);

            // Skip the Scan button completely
            if (isMainAction) {
              return null;
            }

            const iconColor = isFocused ? colors.accent[600] : colors.neutral[500];

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
                  {Platform.OS === 'web' 
                    ? renderWebIcon(route.name, iconColor, 24)
                    : <Icon
                        size={24}
                        color={iconColor}
                        strokeWidth={isFocused ? 2.5 : 2}
                      />
                  }
                </View>
                <Text
                  style={[
                    styles.label,
                    { color: iconColor },
                  ]}
                >
                  {options.title || route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
    pointerEvents: "box-none",
  },
  svgBackground: {
    position: "absolute",
    bottom: 0,
  },
  blurContainer: {
    width: width - 32,
    height: 70,
    borderRadius: 24,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingVertical: 8,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 12,
    marginBottom: 2,
  },
  iconContainerFocused: {
    backgroundColor: colors.accent[50],
  },
  label: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  mainActionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -32,
  },
  mainActionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent[600],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.accent[600],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  mainActionGlow: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent[500],
    opacity: 0.2,
  },
});
