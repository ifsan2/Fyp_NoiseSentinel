# Payment Functionality Implementation

## Overview

This document outlines the implementation of challan payment functionality across the NoiseSentinel system, including:

1. Immutable bank account configuration from appsettings.json
2. Payment status update API endpoint
3. Payment UI in Web Portal (Public Case Status page)
4. Payment UI in Mobile App (Challan Detail screen)

---

## 1. Backend Configuration Changes

### A. Bank Settings Configuration

**File:** `NoiseSentinel.BLL/Configuration/BankSettings.cs` (NEW)

- Created strongly-typed configuration class for bank account details
- Properties: AccountTitle, AccountNumber, BankName, BranchCode, IBAN
- Helper method: `GetFormattedDetails()` returns concatenated bank info string

**File:** `NoiseSentinel.WebApi/appsettings.json`

- Added new "BankDetails" section with complete bank account information:
  ```json
  "BankDetails": {
    "AccountTitle": "Noise Sentinel Traffic Management",
    "AccountNumber": "03467038299-001",
    "BankName": "HBL",
    "BranchCode": "0346",
    "IBAN": "PK80HABB0003467038299001"
  }
  ```

**File:** `NoiseSentinel.WebApi/appsettings.example.json`

- Added BankDetails template for developers

**File:** `NoiseSentinel.WebApi/Program.cs`

- Registered BankSettings configuration in dependency injection container:
  ```csharp
  var bankSettings = builder.Configuration.GetSection("BankDetails");
  builder.Services.Configure<BankSettings>(bankSettings);
  ```

---

### B. Service Layer Updates

**File:** `NoiseSentinel.BLL/Services/ChallanService.cs`

- **Constructor Update:** Added `IOptions<BankSettings> bankSettings` parameter
- **Field Added:** `private readonly BankSettings _bankSettings`
- **CreateChallanAsync Update:** Auto-append bank details from configuration:
  ```csharp
  BankDetails = dto.BankDetails ?? _bankSettings.GetFormattedDetails()
  ```
- **New Method:** `UpdateChallanStatusAsync(int challanId, string newStatus)`
  - Validates status against allowed values: ["Unpaid", "Paid", "Disputed", "Overdue"]
  - Updates challan status in database
  - Returns ServiceResult<bool>

**File:** `NoiseSentinel.BLL/Services/Interfaces/IChallanService.cs`

- Added method signature:
  ```csharp
  Task<ServiceResult<bool>> UpdateChallanStatusAsync(int challanId, string newStatus);
  ```

---

### C. API Controller Updates

**File:** `NoiseSentinel.WebApi/Controllers/ChallanController.cs`

- **New Endpoint:** `PUT /api/challan/{id}/status`
  - Attribute: `[AllowAnonymous]` for public access (accused can pay without authentication)
  - Request DTO: `UpdateChallanStatusRequest { NewStatus }`
  - Validates challan exists
  - Calls service to update status
  - Returns success/error response

---

## 2. Web Portal Changes

### A. API Client Update

**File:** `Noisesentinel.WebPortal/src/api/challanApi.ts`

- Added method:
  ```typescript
  async updateChallanStatus(challanId: number, newStatus: string): Promise<void> {
    await apiClient.put(`/Challan/${challanId}/status`, { newStatus });
  }
  ```

### B. Public Case Status Page

**File:** `Noisesentinel.WebPortal/src/pages/public/PublicCaseStatusPage.tsx`

**Imports Added:**

- `Dialog, DialogTitle, DialogContent, DialogActions` from Material-UI
- `challanApi` for API calls

**State Added:**

- `paymentDialogOpen`: Controls dialog visibility
- `selectedChallan`: Stores selected challan for payment
- `paymentLoading`: Loading state during payment confirmation

**Handlers Added:**

- `handleOpenPaymentDialog(challan)`: Opens payment dialog
- `handleClosePaymentDialog()`: Closes dialog
- `handleConfirmPayment()`: Confirms payment and updates status via API
  - Updates local state to reflect paid status
  - Recalculates unpaid challans count
  - Shows success/error notification

**UI Changes:**

- Added "Action" column to challans table
- Added "Pay Now" button for unpaid challans
- Payment confirmation dialog with:
  - Challan details (ID, violation, amount, station, due date)
  - Bank account details (hardcoded from appsettings)
  - Warning message about transaction receipt
  - Confirm/Cancel buttons

---

## 3. Mobile App Changes

⚠️ **IMPORTANT:** The mobile app is for police officers only, NOT for accused persons. Payment functionality is only in the web portal.

### A. Constants Update

**File:** `NoiseSentinel.MobileApp/src/utils/constants.ts`

- Added `BANK_DETAILS` constant object for display purposes:
  ```typescript
  export const BANK_DETAILS = {
    ACCOUNT_TITLE: "Noise Sentinel Traffic Management",
    ACCOUNT_NUMBER: "03467038299-001",
    BANK_NAME: "HBL",
    BRANCH_CODE: "0346",
    IBAN: "PK80HABB0003467038299001",
    FORMATTED: "Title: ..., Account: ..., Bank: ..., Branch: ..., IBAN: ...",
  };
  ```

### B. Create Challan Screen Update

**File:** `NoiseSentinel.MobileApp/src/screens/challan/CreateChallanScreen.tsx`

**Changes:**

- Imported `BANK_DETAILS` from constants
- Removed `bankDetails` state variable
- Replaced manual bank details input field (TextInput) with read-only display
- Shows bank account information in structured Card layout:
  - Account Title
  - Account Number
  - Bank Name
  - Branch Code
  - IBAN
- Removed bankDetails from challan creation payload (backend auto-appends)
- Added styles: `bankDetailsContainer`, `bankDetailsLabel`, `bankDetailsValue`

**Purpose:** Officers can see the bank account details that will be included in the challan for accused to make payments later via web portal.

### C. API Client Update

**File:** `NoiseSentinel.MobileApp/src/api/challanApi.ts`

- Added method for future use (currently only used by web portal):
  ```typescript
  async updateChallanStatus(challanId: number, newStatus: string): Promise<void> {
    await apiClient.put(`/Challan/${challanId}/status`, { newStatus });
  }
  ```

### D. Challan Detail Screen

**File:** `NoiseSentinel.MobileApp/src/screens/challan/ChallanDetailScreen.tsx`

**No payment functionality added** - Officers can only view challan details, not process payments. Payment is handled by accused persons through the web portal.

---

## 4. Security & Access Control

### API Endpoint Security

- **Endpoint:** PUT `/api/challan/{id}/status`
- **Access:** Public (AllowAnonymous)
- **Rationale:** Allows accused/public to mark challans as paid without authentication
- **Validation:**
  - Challan must exist
  - Status must be one of: ["Unpaid", "Paid", "Disputed", "Overdue"]

### Bank Details Security

- Bank account details are centralized in appsettings.json
- Configuration is read-only at runtime
- Mobile app constants are hardcoded (no user modification)
- Bank details auto-append during challan creation

---

## 5. User Workflows

### A. Accused/Public Payment Flow (Web Portal) ✅

1. Navigate to Public Case Status page
2. Enter vehicle number, CNIC, email
3. Verify OTP
4. View case status with challans list
5. Click "Pay Now" on unpaid challan
6. View payment dialog with bank details
7. Make bank transfer manually
8. Click "Confirm Payment"
9. Challan status updates to "Paid"

### B. Police Officer Creating Challan (Mobile App) ✅

1. Create challan with vehicle/accused details
2. Bank details automatically displayed (read-only)
3. Backend auto-appends bank details from configuration
4. No manual entry required
5. Accused receives challan information (via web portal access)

---

## 6. Testing Checklist

### Backend

- [ ] Bank configuration loads correctly from appsettings.json
- [ ] ChallanService injects BankSettings successfully
- [ ] CreateChallanAsync auto-appends bank details
- [ ] UpdateChallanStatusAsync validates status correctly
- [ ] PUT /api/challan/{id}/status endpoint accessible without auth
- [ ] Payment status updates in database

### Web Portal

- [ ] Payment dialog opens for unpaid challans
- [ ] Bank details display correctly in dialog
- [ ] Payment confirmation updates status
- [ ] Local state updates after payment
- [ ] Unpaid challans count recalculates
- [ ] Success notification appears

### Mobile App

- [ ] BANK_DETAILS constant accessible
- [ ] CreateChallanScreen shows read-only bank info
- [ ] Bank details removed from challan creation payload
- [ ] ChallanDetailScreen shows payment card for unpaid
- [ ] Payment alert shows bank details
- [ ] Payment confirmation updates status
- [ ] Toast notification appears

---

(Police Officers Only)

- [ ] BANK_DETAILS constant accessible
- [ ] CreateChallanScreen shows read-only bank info
- [ ] Bank details removed from challan creation payload
- [ ] ~~ChallanDetailScreen shows payment card~~ (NOT NEEDED - officers don't process payments)
- [ ] ~~Payment functionality in mobile app~~ (NOT NEEDED - only web portal has payment)", "Disputed", "Overdue"

---

## 8. Configuration Required

### For Deployment

1. Update `appsettings.json` with actual bank account details
2. Ensure BankDetails section is present in production config
3. Verify IBAN format for international transfers
4. Test payment confirmation flow end-to-end

### For Development

1. Use `appsettings.example.json` as template
2. Create local `appsettings.json` with test bank details
3. Ensure mobile app constants match backend configuration

---

## 9. Future Enhancements

### Potential Improvements

1. **Payment Gateway Integration:** Integrate with online payment providers (JazzCash, Easypaisa, etc.)
2. **Payment Verification:** Upload/attach payment receipt screenshot
3. **Admin Approval:** Require admin verification before marking as paid
4. **Payment History:** Track payment date, method, transaction ID
5. **Partial Payments:** Support installment-based payments
6. **Payment Reminders:** Send SMS/email reminders for due dates
7. **Dynamic Bank Selection:** Support multiple bank accounts per station
8. **QR Code Generation:** Generate QR code for quick bank transfer

### Security Enhancements

1. Add rate limiting to payment endpoint
2. Log all payment status changes with timestamps and IP addresses
3. Implement OTP verification before payment confirmation
4. Add payment receipt upload requirement
5. Create audit trail for payment modifications

---

## 10. Files Modified/Created

### Backend (C#/.NET)

- ✅ Created: `NoiseSentinel.BLL/Configuration/BankSettings.cs`
- ✅ Modified: `NoiseSentinel.WebApi/appsettings.json`
- ✅ Modified: `NoiseSentinel.WebApi/appsettings.example.json`
- ✅ Modified: `NoiseSentinel.WebApi/Program.cs`
- ✅ Modified: `NoiseSentinel.BLL/Services/ChallanService.cs`
- ✅ Modified: `NoiseSentinel.BLL/Services/Interfaces/IChallanService.cs`
- ✅ Modified: `NoiseSentinel.WebApi/Controllers/ChallanController.cs`

### Web Portal (React/TypeScript)

- ✅ Modified: `Noisesentinel.WebPortal/src/api/challanApi.ts`
- ✅ Modified: `Noisesentinel.WebPortal/src/pages/public/PublicCaseStatusPage.tsx`

### Mobile App (React Native/TypeScript)

- ✅ Modified: `NoiseSentinel.MobileApp/src/utils/constants.ts`
- ✅ Modified: `NoiseSentinel.MobileApp/src/api/challanApi.ts`
- ✅ Modified: `NoiseSentinel.MobileApp/src/screens/challan/CreateChallanScreen.tsx`
- ✅ Modified: `NoiseSentinel.MobileApp/src/screens/challan/ChallanDetailScreen.tsx`

---

## 11. Summary

The payment functionality has been successfully implemented across all three tiers:

1. **Backend:** Immutable bank configuration + Payment status update API
2. **Web Portal:** Payment dialog with b - Police Officers Only

- ✅ Modified: `NoiseSentinel.MobileApp/src/utils/constants.ts`
- ✅ Modified: `NoiseSentinel.MobileApp/src/api/challanApi.ts`
- ✅ Modified: `NoiseSentinel.MobileApp/src/screens/challan/CreateChallan
