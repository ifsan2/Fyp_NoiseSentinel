# Challan Type System - Traffic vs Non-Traffic

## Overview

The NoiseSentinel system now supports two distinct types of challans:

1. **Traffic Violations** - Traditional traffic offenses
2. **Non-Traffic Violations** - Noise and emission-related offenses requiring IoT device measurements

## System Architecture

### Backend (C#/.NET Core)

#### 1. Helper Class

**File:** `NoiseSentinel.BLL/Helpers/ChallanTypeHelper.cs`

- `GetChallanType()` - Determines if challan is Traffic or Non-Traffic
- `GetViolationCategory()` - For Non-Traffic, determines Noise vs Emission
- `IsEmissionReportRecommended()` - Checks if violation requires emission report

**Detection Logic:**

- If `EmissionReportId` exists → Non-Traffic
- If violation type contains keywords → Non-Traffic
- Keywords: noise, emission, sound, silencer, pollution, exhaust, decibel, dba, modified, loud, co2, carbon, smoke, environmental

#### 2. DTOs Modified

**Files:**

- `NoiseSentinel.BLL/DTOs/Challan/ChallanResponseDto.cs`
  - Added computed property: `ChallanType`
- `NoiseSentinel.BLL/DTOs/Challan/ChallanListItemDto.cs`
  - Added computed property: `ChallanType`
- `NoiseSentinel.BLL/DTOs/Violation/ViolationListItemDto.cs`
  - Added computed property: `Category` (Traffic/Non-Traffic)

#### 3. Repository

**File:** `NoiseSentinel.DAL/Repositories/ChallanRepository.cs`

- Added: `GetByTypeAsync(string type)` - Filters challans by type
- Implementation: Uses inline keyword detection to avoid BLL dependency

#### 4. Service Layer

**File:** `NoiseSentinel.BLL/Services/ChallanService.cs`

- Added: `GetChallansByTypeAsync(string type)` - Business logic for filtering
- Added: Validation in `CreateChallanAsync()` - Non-Traffic violations require emission reports

#### 5. API Endpoint

**File:** `NoiseSentinel.WebApi/Controllers/ChallanController.cs`

- Added: `GET /api/challan/type/{type}` - Retrieve challans by type
- Validates type parameter (Traffic/Non-Traffic)

### Mobile App (React Native/TypeScript)

#### 1. Helper Utilities

**File:** `NoiseSentinel.MobileApp/src/utils/challanTypeHelper.ts`

- TypeScript port of backend helper logic
- Same detection algorithms for consistency

#### 2. Components

**File:** `NoiseSentinel.MobileApp/src/components/challan/ChallanTypeBadge.tsx`

- Reusable badge component showing challan type
- Traffic: 🚦 badge
- Non-Traffic: 🔊 badge (Noise) or 💨 badge (Emission)

#### 3. New Screens

##### ChallanTypeSelectionScreen.tsx

- **Purpose:** Initial screen for selecting Traffic vs Non-Traffic
- **UI:** Two large cards with icons
- **Navigation:**
  - Traffic → CreateChallanScreen with challanType="Traffic"
  - Non-Traffic → ViolationCategoryScreen

##### ViolationCategoryScreen.tsx

- **Purpose:** For Non-Traffic, select Noise vs Emission
- **Features:**
  - Checks for paired IoT device
  - Prompts device pairing if needed
- **Navigation:**
  - Noise → CreateChallanScreen with challanType="Non-Traffic", violationCategory="Noise"
  - Emission → CreateChallanScreen with challanType="Non-Traffic", violationCategory="Emission"

##### CreateChallanScreen.tsx (Major Refactor)

- **Dual Flow Support:**
  - **Traffic Flow:** 4 steps
    1. Select Violation
    2. Vehicle Details
    3. Accused Details
    4. Evidence & Submit
  - **Non-Traffic Flow:** 6 steps (starts at step 2) 2. Vehicle Details 3. Accused Details 4. Device Scan (NEW) 5. Select Violation 6. Evidence & Submit

- **Device Scan Step (Step 4 for Non-Traffic):**
  - Shows paired device info
  - Simulates device scanning
  - For Noise: measures sound level (dB)
  - For Emission: measures CO, CO₂, HC, NOx
  - Auto-creates emission report after successful scan
  - Validates measurements before proceeding

- **Route Parameters:**
  - `challanType`: "Traffic" | "Non-Traffic"
  - `violationCategory`: "Noise" | "Emission" (for Non-Traffic)
  - `deviceId`: ID of paired IoT device (for Non-Traffic)
  - `emissionReportId`: Pre-existing emission report (optional)

- **State Management:**
  - New state variables for device scan data
  - `createdEmissionReportId` tracks auto-created reports
  - Step validation differs by challan type

#### 4. Navigation Updates

##### MainNavigator.tsx

- Added screens: `ChallanTypeSelection`, `ViolationCategory`
- Kept `CreateChallan` for direct access with params

##### TabNavigator.tsx

- Changed "Scan" tab to use `ChallanTypeSelectionScreen` instead of `CreateChallanScreen`

##### DashboardScreen.tsx

- **REMOVED:** "Generate Report" quick action
- **UPDATED:** "Create Challan" now navigates to `ChallanTypeSelection`

## User Flows

### Traffic Violation Flow

1. User taps "Create Challan" from Dashboard or Scan tab
2. ChallanTypeSelectionScreen → Select "Traffic Violation"
3. CreateChallanScreen opens with challanType="Traffic", starting at step 1
4. Steps:
   - Step 1: Select violation from traffic violations
   - Step 2: Enter/search vehicle details
   - Step 3: Enter/search accused details
   - Step 4: Upload evidence and submit
5. Challan created without emission report

### Non-Traffic Violation Flow

1. User taps "Create Challan" from Dashboard or Scan tab
2. ChallanTypeSelectionScreen → Select "Non-Traffic Violation"
3. ViolationCategoryScreen → Choose "Noise" or "Emission"
   - If no device paired, prompts to pair device first
4. CreateChallanScreen opens with:
   - challanType="Non-Traffic"
   - violationCategory="Noise" or "Emission"
   - deviceId from paired device
   - Starting at step 2
5. Steps:
   - Step 2: Enter/search vehicle details
   - Step 3: Enter/search accused details
   - Step 4: **Device Scan**
     - Shows device info
     - Taps "Start Scan"
     - For Noise: measures sound level
     - For Emission: measures gases (CO, CO₂, HC, NOx)
     - Auto-creates emission report
   - Step 5: Select violation from noise/emission violations
   - Step 6: Upload evidence and submit
6. Challan created with linked emission report

## Validation Rules

### Backend

- Non-Traffic challans **must** have an `EmissionReportId`
- Validated in `ChallanService.CreateChallanAsync()`

### Mobile App

- Traffic violations: No device needed, no emission report
- Non-Traffic violations:
  - Requires paired IoT device
  - Must complete device scan (step 4)
  - Violation selection filtered by category (Noise/Emission)
  - Auto-creates emission report after scan

## Database Schema

**NO CHANGES** - Uses computed properties and runtime detection

## Keywords for Detection

The following keywords in `ViolationType` trigger Non-Traffic classification:

- noise
- emission
- sound
- silencer
- pollution
- exhaust
- decibel
- dba
- modified
- loud
- co2
- carbon
- smoke
- environmental

## Testing Checklist

### Backend

- [ ] Test `GET /api/challan/type/Traffic`
- [ ] Test `GET /api/challan/type/Non-Traffic`
- [ ] Test challan creation with Traffic violation (no emission report)
- [ ] Test challan creation with Non-Traffic violation (requires emission report)
- [ ] Verify computed `ChallanType` property in DTOs

### Mobile App

- [ ] Test Traffic flow: Type selection → Violation → Vehicle → Accused → Submit
- [ ] Test Non-Traffic Noise flow: Type selection → Category → Device check → Vehicle → Accused → Scan → Violation → Submit
- [ ] Test Non-Traffic Emission flow: Same as Noise but with gas measurements
- [ ] Verify device pairing requirement for Non-Traffic
- [ ] Verify step indicators show correct total (4 for Traffic, 5 for Non-Traffic)
- [ ] Test violation filtering by category
- [ ] Verify emission report auto-creation after scan
- [ ] Test navigation from Dashboard "Create Challan"
- [ ] Test navigation from Scan tab
- [ ] Verify "Generate Report" button removed from Dashboard

## Files Changed

### Backend

1. **Created:**
   - `NoiseSentinel.BLL/Helpers/ChallanTypeHelper.cs`

2. **Modified:**
   - `NoiseSentinel.BLL/DTOs/Challan/ChallanResponseDto.cs`
   - `NoiseSentinel.BLL/DTOs/Challan/ChallanListItemDto.cs`
   - `NoiseSentinel.BLL/DTOs/Violation/ViolationListItemDto.cs`
   - `NoiseSentinel.DAL/Repositories/Interfaces/IChallanRepository.cs`
   - `NoiseSentinel.DAL/Repositories/ChallanRepository.cs`
   - `NoiseSentinel.BLL/Services/Interfaces/IChallanService.cs`
   - `NoiseSentinel.BLL/Services/ChallanService.cs`
   - `NoiseSentinel.WebApi/Controllers/ChallanController.cs`

### Mobile App

1. **Created:**
   - `NoiseSentinel.MobileApp/src/utils/challanTypeHelper.ts`
   - `NoiseSentinel.MobileApp/src/components/challan/ChallanTypeBadge.tsx`
   - `NoiseSentinel.MobileApp/src/screens/challan/ChallanTypeSelectionScreen.tsx`
   - `NoiseSentinel.MobileApp/src/screens/challan/ViolationCategoryScreen.tsx`

2. **Modified:**
   - `NoiseSentinel.MobileApp/src/screens/challan/CreateChallanScreen.tsx` (Major refactor)
   - `NoiseSentinel.MobileApp/src/navigation/MainNavigator.tsx`
   - `NoiseSentinel.MobileApp/src/navigation/TabNavigator.tsx`
   - `NoiseSentinel.MobileApp/src/screens/dashboard/DashboardScreen.tsx`

## Future Enhancements

1. Real device integration (replace simulated scan)
2. Historical data analysis by challan type
3. Reports/analytics dashboard for Traffic vs Non-Traffic violations
4. Bulk operations filtered by type
5. Web portal integration with type filtering
