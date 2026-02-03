// Responsive Design Utilities
// Helps create fluid, adaptive layouts for different screen sizes

import { Dimensions, Platform, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Base dimensions (iPhone 11 Pro)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scales value based on screen width
 */
export const wp = (percentage: number): number => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

/**
 * Scales value based on screen height
 */
export const hp = (percentage: number): number => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

/**
 * Scales font size based on screen width
 */
export const scale = (size: number): number => {
  const ratio = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(PixelRatio.roundToNearestPixel(size * ratio));
};

/**
 * Moderate scale - scales less aggressively for better readability
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  const ratio = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(
    PixelRatio.roundToNearestPixel(size + (ratio - 1) * size * factor),
  );
};

/**
 * Check if device is a small screen
 */
export const isSmallDevice = (): boolean => {
  return SCREEN_WIDTH < 375 || SCREEN_HEIGHT < 667;
};

/**
 * Check if device is a tablet
 */
export const isTablet = (): boolean => {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  return (
    (Platform.OS === "ios" && aspectRatio < 1.6) ||
    (Platform.OS === "android" && SCREEN_WIDTH >= 600)
  );
};

/**
 * Get responsive spacing
 */
export const responsiveSpacing = {
  xs: isSmallDevice() ? 3 : 4,
  sm: isSmallDevice() ? 6 : 8,
  md: isSmallDevice() ? 12 : 16,
  lg: isSmallDevice() ? 18 : 24,
  xl: isSmallDevice() ? 24 : 32,
  xxl: isSmallDevice() ? 36 : 48,
  xxxl: isSmallDevice() ? 48 : 64,
};

/**
 * Get responsive font sizes
 */
export const responsiveFontSize = {
  xs: moderateScale(10),
  sm: moderateScale(12),
  md: moderateScale(14),
  base: moderateScale(16),
  lg: moderateScale(18),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  xxxl: moderateScale(32),
  display: moderateScale(36),
};

export const dimensions = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmall: isSmallDevice(),
  isTablet: isTablet(),
};
