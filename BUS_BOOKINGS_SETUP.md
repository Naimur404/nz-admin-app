# Bus Bookings Feature Documentation

## Overview
The Bus Bookings feature allows users to view, search, and filter bus booking records.

## Files Created

### 1. Types (`types/bus.ts`)
- `BusBooking` - Interface for individual booking records
- `BusBookingFilters` - Interface for search/filter parameters
- `BusBookingResponse` - Interface for API response with pagination
- `BookingStatusMap` - Interface for booking status mapping
- `BookingStatusResponse` - Interface for booking status API response

### 2. Services

#### `services/booking-status.ts`
Global booking status service with caching:
- `getBookingStatuses()` - Fetches status list from `/booking-status` API
- `getStatusLabel()` - Returns status label by value
- `getStatusOptions()` - Converts statuses to dropdown options
- `clearCache()` - Clears the cached statuses

**Important**: Status values are sent as strings (e.g., "CONFIRMED") not as indexes.

#### `services/bus.ts`
Bus booking service:
- `getBookings(filters)` - Fetches bus bookings from `/bus/bookings` API

### 3. Page (`app/bus/bookings.tsx`)
Bus bookings list page with:
- Date range filters (from_date, to_date)
- Search filters (booking ID/PNR, agent, ticket number)
- Status dropdown filter
- Pagination (15 items per page)
- Responsive card layout

## API Endpoints

### GET `/bus/bookings`
Fetch bus bookings with filters.

**Query Parameters:**
```
from_date: string (YYYY-MM-DD) - required
to_date: string (YYYY-MM-DD) - required
booking_id_or_pnr: string - optional
agent_sl_or_name: string - optional
ticket_number: string - optional
status: string - optional (e.g., "CONFIRMED", not index)
page: number - default: 1
per_page: number - default: 15
```

### GET `/booking-status`
Fetch available booking statuses (cached globally).

**Response:**
```json
{
  "code": 200,
  "data": {
    "1": "CONFIRMED",
    "2": "TICKET IN PROCESS",
    "3": "BOOKED",
    ...
  }
}
```

## Display Fields

The booking list shows:
1. **Booking Date** - Created date formatted (DD MMM YYYY)
2. **Booking Id** - Unique booking ID
3. **Agent** - Agent name
4. **Booking Ref No** - Booking reference number
5. **PNR** - Passenger Name Record
6. **Brand** - API name (RB, etc.)
7. **Ticket Number** - Ticket numbers
8. **Cost** - Costing amount with currency
9. **Payment** - Total selling price with currency
10. **Profit** - Calculated (Payment - Cost)
11. **Status** - Color-coded status badge

## Status Colors

- **CONFIRMED** - Green (#10b981)
- **CANCELED/VOID** - Red (#ef4444)
- **FAILED/REJECT** - Orange (#f59e0b)
- **Others** - Gray (#6b7280)

## Navigation

From the home screen, click **"View Bus Bookings"** button to access the page.

Route: `/bus/bookings`

## Usage Example

```typescript
// Using booking status service
import { bookingStatusService } from '@/services/booking-status';

// Fetch statuses (cached)
const statuses = await bookingStatusService.getBookingStatuses();

// Get dropdown options
const options = bookingStatusService.getStatusOptions(statuses);

// Send status as string value
const filters = {
  status: "CONFIRMED", // Not "1"
  ...
};
```

## Features

✅ Date range filtering (defaults to today)
✅ Multiple search filters
✅ Status dropdown with all available statuses
✅ Pagination with Previous/Next buttons
✅ Responsive card layout for mobile
✅ Color-coded status badges
✅ Profit calculation
✅ Loading states
✅ Empty state handling
✅ Global booking status caching

## Dependencies

- `@react-native-picker/picker` - Dropdown select for filters
- `react-native-safe-area-context` - Safe area handling
