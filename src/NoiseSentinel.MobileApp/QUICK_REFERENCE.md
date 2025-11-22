# Quick Reference: Design System Usage

## 🎨 Using Colors

```typescript
import { colors } from '../../styles/colors';

// Primary (Deep Navy)
color: colors.primary[600]        // #0F172A - Main brand
color: colors.primary[500]        // Lighter variant
color: colors.primary[700]        // Darker variant

// Accent (Electric Indigo)
color: colors.accent[600]         // #6366F1 - Highlights
color: colors.accent[500]         // Lighter
color: colors.accent[700]         // Darker

// Backgrounds
backgroundColor: colors.background.primary    // #F8FAFC - Off-white
backgroundColor: colors.background.secondary  // #F1F5F9 - Subtle gray

// Text
color: colors.text.primary        // #1E293B - Dark slate
color: colors.text.secondary      // #475569 - Medium slate
color: colors.text.tertiary       // #94A3B8 - Light slate

// Soft Shadows
shadowColor: colors.shadow.light  // #64748B
shadowOpacity: 0.08               // 8%
shadowRadius: 16                  // Diffuse blur
```

---

## 🔤 Using Typography

```typescript
import { typography } from '../../styles/typography';

// Headings
<Text style={typography.heading}>Dashboard</Text>
// PlusJakartaSans_700Bold, 28px, line-height 36, letter-spacing -0.5

<Text style={typography.subheading}>Performance Today</Text>
// PlusJakartaSans_600SemiBold, 20px, line-height 28, letter-spacing -0.3

// Body
<Text style={typography.bodyLarge}>Welcome back, Officer</Text>
// PlusJakartaSans_400Regular, 16px, line-height 24

<Text style={typography.bodyMedium}>Today's Challans</Text>
// PlusJakartaSans_500Medium, 14px, line-height 20

<Text style={typography.bodySmall}>Secondary info</Text>
// PlusJakartaSans_400Regular, 12px, line-height 16

// Captions
<Text style={typography.caption}>Timestamp or metadata</Text>
// PlusJakartaSans_400Regular, 10px, line-height 14, letter-spacing 0.3
```

---

## 📏 Using Spacing (8pt Grid)

```typescript
import { spacing, borderRadius } from '../../styles/spacing';

// Padding/Margins
padding: spacing.xs        // 4px - Micro-spacing
padding: spacing.sm        // 8px - Tight
padding: spacing.md        // 16px - Standard (default)
padding: spacing.lg        // 24px - Section gaps
padding: spacing.xl        // 32px - Large breaks
padding: spacing.xxl       // 48px - Major sections
padding: spacing.xxxl      // 64px - Hero spacing

// Border Radius
borderRadius: borderRadius.sm       // 4px - Tight corners
borderRadius: borderRadius.md       // 8px - Standard buttons
borderRadius: borderRadius.lg       // 12px - Input fields
borderRadius: borderRadius.xl       // 16px - Small cards
borderRadius: borderRadius.xxl      // 24px - Large cards (Apple-like)
```

**Always use 8pt grid! Examples:**
```typescript
// ✅ Correct
padding: spacing.md,              // 16
marginTop: spacing.lg,            // 24
gap: spacing.xl,                  // 32

// ❌ Wrong
padding: 15,                      // Not divisible by 8
marginTop: 17,                    // Breaks grid
gap: 22,                          // Arbitrary value
```

---

## 🎭 Using Lucide Icons

```typescript
import { Link, BarChart3, FileText, User, Car } from 'lucide-react-native';

// Standard usage
<Link size={24} color={colors.primary[600]} strokeWidth={2} />

// In buttons/touchables
<TouchableOpacity>
  <User size={20} color={colors.accent[600]} strokeWidth={2} />
  <Text>Profile</Text>
</TouchableOpacity>

// Dynamic color
<Shield 
  size={32} 
  color={isFocused ? colors.accent[600] : colors.text.tertiary} 
  strokeWidth={2} 
/>
```

**Available Icons:**
- **Navigation:** Home, Clock, Scan, User, ChevronRight
- **Actions:** Link, BarChart3, FileText, History, Search
- **Objects:** Car, Shield, Lock, Bell, Info
- **Status:** AlertTriangle, CheckCircle, XCircle
- **Auth:** Eye, EyeOff, LogOut

**Icon Sizes:**
- 16px - Tiny (inline text)
- 20px - Small (menu items)
- 24px - Standard (tab bar)
- 28px - Medium (action cards)
- 32px - Large (stat cards, headers)
- 40px - Hero (profile avatar)

---

## 🃏 Using Cards

```typescript
import { Card } from '../../components/common/Card';

// Default card (white background, subtle border)
<Card>
  <Text>Content</Text>
</Card>

// Elevated card (with soft shadow)
<Card variant="elevated">
  <Text>Elevated content</Text>
</Card>

// Glass card (with BlurView)
<Card variant="glass">
  <Text>Premium glassmorphism</Text>
</Card>

// Custom styling
<Card style={{ padding: spacing.lg, marginBottom: spacing.md }}>
  <Text>Custom padding</Text>
</Card>
```

**Card Specifications:**
```typescript
borderRadius: 24,                    // ✅ Apple-like softness
borderWidth: 1,                      // ✅ Subtle definition
borderColor: colors.border.light,    // ✅ #E2E8F0
shadowColor: colors.shadow.light,    // ✅ #64748B
shadowOpacity: 0.08,                 // ✅ Soft shadow
shadowRadius: 16,                    // ✅ Diffuse blur
shadowOffset: { width: 0, height: 4 },
```

---

## 📝 Using Input Fields

```typescript
import { Input } from '../../components/common/Input';

// Standard input
<Input 
  label="Username"
  placeholder="Enter username"
  value={username}
  onChangeText={setUsername}
/>

// Password input (auto Eye icon)
<Input 
  label="Password"
  placeholder="Enter password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
/>

// With custom icon
<Input 
  label="Search"
  placeholder="Search vehicles..."
  value={search}
  onChangeText={setSearch}
  leftIcon={<Search size={20} color={colors.text.tertiary} />}
/>

// Error state
<Input 
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
  error="Invalid email format"
/>
```

**Input Features:**
- ✅ Material Design 3 filled style
- ✅ Label always above (no collision)
- ✅ Smooth focus animations (150ms)
- ✅ Auto Eye/EyeOff for passwords
- ✅ Error state with red accent
- ✅ 12px border radius, 8px padding

---

## 💀 Using Skeleton Loaders

```typescript
import { Skeleton, SkeletonCard, SkeletonStat, SkeletonList } from '../../components/common/Skeleton';

// Basic skeleton
<Skeleton width={200} height={20} />

// Card skeleton
<SkeletonCard />

// Stat skeleton (for dashboard)
<View style={styles.statsGrid}>
  <SkeletonStat />
  <SkeletonStat />
</View>

// List skeleton
<SkeletonList count={5} />

// Conditional rendering
{loading ? (
  <SkeletonCard />
) : (
  <Card>
    <Text>{data.title}</Text>
  </Card>
)}
```

**Shimmer Specifications:**
```typescript
// LinearGradient colors
colors={[
  "rgba(255, 255, 255, 0)",        // Transparent
  "rgba(255, 255, 255, 0.5)",      // Semi-transparent (shimmer)
  "rgba(255, 255, 255, 0)",        // Transparent
]}

// Animation duration
duration: 1500,                     // 1.5 seconds per cycle
```

---

## 🎬 Using Animations

```typescript
import Reanimated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';

// Entrance animation (fade + slide up)
<Reanimated.View entering={FadeInUp.duration(600)}>
  <Card>Content</Card>
</Reanimated.View>

// With delay (staggered effect)
<Reanimated.View entering={FadeInUp.duration(500).delay(100)}>
  <Card>Card 1</Card>
</Reanimated.View>
<Reanimated.View entering={FadeInUp.duration(500).delay(200)}>
  <Card>Card 2</Card>
</Reanimated.View>

// Layout animation (smooth re-layout)
<Reanimated.View 
  entering={FadeInUp.duration(600)} 
  layout={Layout.springify()}
>
  <Card>Dynamic content</Card>
</Reanimated.View>

// Custom animated value
const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 600,
    useNativeDriver: true,  // ✅ Required for performance
  }).start();
}, []);

<Animated.View style={{ opacity: fadeAnim }}>
  <Content />
</Animated.View>
```

---

## 📳 Using Haptic Feedback

```typescript
import * as Haptics from 'expo-haptics';

// Light tap (buttons, tabs)
<TouchableOpacity onPress={() => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // Your action
}}>
  <Text>Tap Me</Text>
</TouchableOpacity>

// Medium impact (important actions)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy impact (destructive actions)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Success notification
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Error notification
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

---

## 🌫️ Using BlurView (Glassmorphism)

```typescript
import { BlurView } from 'expo-blur';

// Light glassmorphism
<BlurView intensity={90} tint="light" style={styles.glassContainer}>
  <Text>Content over blur</Text>
</BlurView>

// Dark glassmorphism
<BlurView intensity={80} tint="dark" style={styles.glassContainer}>
  <Text style={{ color: 'white' }}>Dark mode content</Text>
</BlurView>

// Tab bar example
<BlurView 
  intensity={90} 
  tint="light" 
  style={{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  }}
>
  {/* Tab buttons */}
</BlurView>
```

**Intensity Guide:**
- 60-70 - Subtle blur (backgrounds)
- 80-90 - Medium blur (tab bar, headers)
- 95-100 - Heavy blur (modals, overlays)

---

## 🎨 Creating Gradients

```typescript
import { LinearGradient } from 'expo-linear-gradient';

// Primary gradient
<LinearGradient
  colors={[colors.primary[600], colors.primary[700]]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.container}
>
  <Text>Content</Text>
</LinearGradient>

// Accent gradient
<LinearGradient
  colors={[colors.accent[500], colors.accent[600]]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
>
  <Text>Accent content</Text>
</LinearGradient>

// Shimmer gradient (skeleton loaders)
<LinearGradient
  colors={[
    "rgba(255, 255, 255, 0)",
    "rgba(255, 255, 255, 0.5)",
    "rgba(255, 255, 255, 0)",
  ]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
>
  {/* Shimmer effect */}
</LinearGradient>
```

---

## 🧭 Tab Bar Usage

```typescript
// Tab bar is auto-generated from route config
// Icons are in GlassTabBar.tsx:

const icons = {
  Dashboard: Home,
  History: Clock,
  Scan: Scan,
  Profile: User,
};

// To add new tab:
// 1. Add screen to stack navigator
// 2. Add icon mapping in GlassTabBar.tsx
// 3. Ensure Lucide icon is imported
```

---

## 🎯 Best Practices

### ✅ Do
```typescript
// Use design system constants
padding: spacing.md
color: colors.primary[600]
...typography.bodyMedium

// Use Lucide icons
<Link size={24} color={colors.accent[600]} strokeWidth={2} />

// Use 8pt grid
marginTop: spacing.lg  // 24px

// Use skeleton loaders
{loading ? <SkeletonCard /> : <Card>{data}</Card>}

// Use haptic feedback
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

// Use soft shadows
shadowOpacity: 0.08
shadowRadius: 16
```

### ❌ Don't
```typescript
// Don't use arbitrary values
padding: 15  // ❌ Not divisible by 8

// Don't use emoji icons
icon: "🔗"  // ❌ Use Lucide instead

// Don't use pure white backgrounds
backgroundColor: "#FFFFFF"  // ❌ Use colors.background.primary

// Don't use harsh shadows
shadowOpacity: 0.5  // ❌ Too heavy
shadowRadius: 4     // ❌ Too tight

// Don't use system fonts
fontFamily: "System"  // ❌ Use Plus Jakarta Sans

// Don't skip loading states
{!loading && <Card>{data}</Card>}  // ❌ Use skeleton
```

---

## 🧪 Testing Checklist

### Visual Consistency
- [ ] All icons are Lucide (no emojis)
- [ ] All spacing uses 8pt grid
- [ ] All shadows are soft (0.05-0.08 opacity)
- [ ] All cards use 24px border radius
- [ ] All text uses Plus Jakarta Sans

### Interaction
- [ ] Haptic feedback on all taps
- [ ] Smooth entrance animations
- [ ] Loading states with skeletons
- [ ] Focus states on inputs

### Accessibility
- [ ] Contrast ratio ≥ 7:1 (WCAG AAA)
- [ ] Touch targets ≥ 44x44px
- [ ] Screen reader labels
- [ ] Focus indicators visible

### Performance
- [ ] Animations use native driver
- [ ] No layout thrashing
- [ ] Optimized re-renders
- [ ] Font loading complete

---

## 📚 File Locations

```
src/
├── styles/
│   ├── colors.ts           # Color system
│   ├── typography.ts       # Typography with Plus Jakarta Sans
│   └── spacing.ts          # 8pt grid + border radius
├── components/
│   ├── common/
│   │   ├── Input.tsx       # Material Design 3 input
│   │   ├── Card.tsx        # Cards with variants
│   │   └── Skeleton.tsx    # Shimmer loaders
│   └── navigation/
│       ├── GlassTabBar.tsx # Tab bar with Bézier curve
│       └── Header.tsx      # BlurView header
└── screens/
    ├── auth/
    │   └── LoginScreen.tsx
    ├── dashboard/
    │   └── DashboardScreen.tsx
    └── profile/
        └── ProfileScreen.tsx
```

---

## 🚀 Quick Start

```bash
# Install dependencies
cd NoiseSentinel.MobileApp
npm install

# Start dev server
npx expo start

# Run on device
npx expo start --tunnel
```

---

## 🆘 Common Issues

### Reanimated not working
```bash
# Clear cache
npx expo start --clear

# Ensure babel plugin is in babel.config.js
plugins: ['react-native-reanimated/plugin']
```

### Fonts not loading
```typescript
// Ensure font loading in App.tsx
import { useFonts } from 'expo-font';
import { PlusJakartaSans_400Regular, ... } from '@expo-google-fonts/plus-jakarta-sans';

const [fontsLoaded] = useFonts({
  PlusJakartaSans_400Regular,
  // ... other weights
});

if (!fontsLoaded) return <ActivityIndicator />;
```

### BlurView not rendering
```bash
# iOS: Ensure you're testing on device or simulator (not Expo Go)
# Android: BlurView requires SDK 31+
```

---

**Quick Reference Version:** 1.0
**Last Updated:** Design System Complete
**Design Grade:** $50K App Quality
