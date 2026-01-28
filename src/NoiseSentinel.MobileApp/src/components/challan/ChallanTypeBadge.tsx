import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  CHALLAN_TYPE,
  ChallanType,
  getChallanTypeBgColor,
  getChallanTypeColor,
} from "../../utils/challanTypeHelper";

interface ChallanTypeBadgeProps {
  type: ChallanType;
  size?: "small" | "medium" | "large";
}

export const ChallanTypeBadge: React.FC<ChallanTypeBadgeProps> = ({
  type,
  size = "medium",
}) => {
  const color = getChallanTypeColor(type);
  const bgColor = getChallanTypeBgColor(type);

  const sizeStyles = {
    small: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    medium: { paddingHorizontal: 10, paddingVertical: 4, fontSize: 12 },
    large: { paddingHorizontal: 14, paddingVertical: 6, fontSize: 14 },
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: color,
            fontSize: sizeStyles[size].fontSize,
          },
        ]}
      >
        {type === CHALLAN_TYPE.NON_TRAFFIC ? "🔊 Non-Traffic" : "🚦 Traffic"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontWeight: "600",
  },
});
