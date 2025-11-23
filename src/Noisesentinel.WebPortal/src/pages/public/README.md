# Public Challan Search Feature

## Overview

This feature allows the public to search for traffic violation challans without authentication using their vehicle plate number and CNIC.

## Implementation Details

### Backend Endpoint (Already Exists)

- **Endpoint**: `POST /api/Challan/public/search`
- **Authorization**: None (AllowAnonymous)
- **Request Body**:
  ```json
  {
    "plateNumber": "PK-ABC-123",
    "cnic": "35202-1234567-8"
  }
  ```
- **Response**: List of matching challans

### Frontend Implementation

#### 1. API Method

**File**: `src/api/challanApi.ts`

- Added `searchChallansByPlateAndCnic()` method
- Uses POST request to `/Challan/public/search`
- No authentication required

#### 2. Public Page Component

**File**: `src/pages/public/PublicChallanSearchPage.tsx`

- Beautiful, responsive search form
- Real-time validation for plate number and CNIC
- Results display with detailed challan information
- Print functionality for individual or all challans

#### 3. Routing

**File**: `src/routes/AppRouter.tsx`

- Added public route: `/search-challans`
- No authentication required
- Accessible to everyone

## Features

### Search Form

- **Vehicle Plate Number** input with icon
- **CNIC** input with format validation (12345-1234567-1)
- Form validation with error messages
- Loading state during search

### Results Display

- Card-based layout for each challan
- Status badges (Paid, Unpaid, Disputed)
- Warning badges for overdue challans
- FIR status indicator
- Cognizable offense indicator
- Detailed information sections:
  - Violation details
  - Penalty amount
  - Important dates
  - Vehicle information
  - Accused information
  - Officer and station details
  - Payment/bank details

### Print Functionality

- **Print Individual Challan**: Click print icon on any challan card
- **Print All Challans**: Use "Print All" button at the top
- Professional print layout inspired by City Traffic Police format:
  - Official header with Noise Sentinel branding
  - Barcode placeholders for ticket tracking
  - Structured information sections with borders
  - Vehicle and accused details in tabular format
  - Violation box with e-ticketing center info
  - Emission report section (when applicable)
  - Penalty amount prominently displayed
  - Instructions and notes section
  - Officer and station details
  - Treasury copy (tear-off section)
  - Post office copy (tear-off section)
  - Footer with timestamp
  - Page breaks for multiple challans

### Styling & Theme

- Matches WebPortal theme (light/dark mode support)
- Modern gradient backgrounds
- Card-based layout with hover effects
- Responsive design (mobile-friendly)
- Material-UI components for consistency
- Professional color scheme

## Usage

### For End Users

1. Visit: `http://your-domain/search-challans`
2. Enter your vehicle plate number (e.g., PK-ABC-123)
3. Enter your CNIC in format: 12345-1234567-1
4. Click "Search"
5. View your challans
6. Print individual or all challans

### For Developers

The public search page can be accessed directly without logging in:

- Development: `http://localhost:5173/search-challans`
- Production: `https://your-domain/search-challans`

## Security

- Both plate number AND CNIC must match for results
- No authentication required (public endpoint)
- No sensitive data exposed beyond what's on the challan
- Backend validates both parameters before returning results

## Testing

1. Start the backend API
2. Start the frontend dev server
3. Navigate to `/search-challans`
4. Test with valid plate number and CNIC combination
5. Verify search results display correctly
6. Test print functionality

## Files Modified/Created

### Created

- `src/pages/public/PublicChallanSearchPage.tsx` - Main page component
- `src/pages/public/index.ts` - Index exports

### Modified

- `src/api/challanApi.ts` - Added public search method
- `src/routes/AppRouter.tsx` - Added public route

## Notes

- The axios interceptor only adds authentication token if available, so public endpoints work without login
- Print feature opens new window/tab and triggers browser print dialog
- Form validation matches backend validation rules
- Theme toggle available on public page for user preference
