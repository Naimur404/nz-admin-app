export interface HotelBooking {
  id: number;
  hotel_api_info_id: number;
  agent_request_status: string | null;
  refund_time_limit: string | null;
  status: string;
  unique_trans_id: string;
  platform_type: string;
  total_price_selling: string;
  total_price_buying: string;
  currency: string;
  check_in: string;
  check_out: string;
  booking_time_limit: string;
  original_currency: string;
  receipt_path: string | null;
  pay_amount_from_customer: string;
  payment_method: string;
  branch: string;
  remarks_for_payment: string | null;
  api_name: string;
  payment_status: string | null;
  agent_sl_no: string;
  agent_name: string;
  booking_date: string;
  on_process_time: string | null;
  support_staff_name: string;
}

export interface HotelBookingDetails {
  id: number;
  sub_agent_id: number | null;
  reference_no: string;
  unique_trans_id: string;
  hotel_name: string;
  map_location_data: {
    mapUrl: string;
    latitude: number;
    longitude: number;
  };
  must_know_info: {
    cotInfo: any;
    petInfo: any;
    mealInfo: Array<{
      price: number;
      currency: string;
      mealType: string;
      priceType: string;
    }>;
    noShowInfo: any;
    depositInfo: Array<{
      price: number;
      currency: string;
      required: boolean;
      priceUnit: string;
      depositType: string;
      paymentType: string;
      pricingMethod: string;
    }>;
    generalInfo: string;
    parkingInfo: any;
    shuttleInfo: any;
    extraBedInfo: Array<{
      price: number;
      amount: number;
      currency: string;
      priceType: string;
      priceUnit: string;
    }>;
    internetInfo: any;
    childMealInfo: Array<{
      price: number;
      toAge: number;
      fromAge: number;
      currency: string;
      mealType: string;
      priceType: string;
    }>;
    frontDeskInfo: {
      endTime: string;
      startTime: string;
      timeFormat: string;
    };
    electricityInfo: {
      voltage: string[];
      frequency: string[];
      socketTypes: string[];
      frequencyUnit: string;
    };
    visaSupportInfo: any;
    childExtraBedInfo: any;
    checkInCheckOutInfo: {
      timeFormat: string;
      checkInTime: string;
      checkOutTime: string;
    };
  };
  meal_info: {
    breakfast: boolean;
    hasChildMeal: boolean;
    fullMealDetails: any;
  };
  not_included_tax: Array<{
    taxType: string;
    currency: string;
    taxAmount: number;
    includedInPrice: boolean;
  }>;
  hero_image_url: string;
  hotel_phone_number: string;
  hotel_email_address: string;
  city: string;
  address: string;
  check_in: string;
  check_out: string;
  booking_date: string;
  nationality: string | null;
  lead_pax_name: string;
  guest_email: string;
  contact_no: string;
  original_total_price: string;
  total_price_selling: string;
  misc_charge: string;
  misc_charge_type: string | null;
  receipt_path: string | null;
  pay_amount_from_customer: string;
  payment_method: string;
  branch: string;
  remarks_for_payment: string | null;
  status: string;
  status_date: string;
  status_by: number;
  trans_status: string;
  booking_time_limit: string;
  remarks: string | null;
  support_type: string | null;
  agent_request_status: string | null;
  refund_amount: string | null;
  refund_charge: string | null;
  service_charge: string | null;
  refund_reason: string | null;
  refund_time_limit: string | null;
  void_requested_at: string | null;
  void_expires_at: string | null;
  void_validity_minutes: number | null;
  admin_notes: string | null;
  refund_status: string | null;
  refund_expected_date: string | null;
  refund_payment_id: string | null;
  support_date_time: string | null;
  ticket_issue_date: string | null;
  platform_type: string;
  retry_count: number;
  booking_error: string | null;
  refund_error: string | null;
  price_breakdown: {
    base_price: string;
    taxes: string;
    total_price: string;
    gateway_fee: string;
    currency: string;
  };
  original_price_breakdown: {
    base_price: string;
    taxes: string;
    total_price: string;
    original_currency: string;
  };
  rooms: Array<{
    id: number;
    hotel_booking_info_id: number;
    room_no: string;
    room_type: string;
    price: string;
    currency: string;
    original_price: string;
    original_currency: string;
    discount_price: string;
    booking_status: string;
  }>;
  guests: Array<{
    id: number;
    hotel_booking_info_id: number;
    hotel_booking_room_id: number;
    is_lead: number;
    type: string;
    full_name: string;
    room_no: string;
    child_age: number;
    gender: string;
  }>;
  cancellation_policies: Array<{
    id: number;
    hotel_booking_info_id: number;
    hotel_booking_room_id: number;
    from_date: string;
    to_date: string;
    cancellation_price: string;
    currency: string;
    original_cancellation_price: string;
    original_currency: string;
    essential_information: string;
  }>;
  facilities: any[];
}

export interface HotelBookingDetailsResponse {
  code: number;
  data: HotelBookingDetails;
  message: string;
  flag: boolean;
}

export interface HotelBookingsResponse {
  code: number;
  data: HotelBooking[];
  message: string;
  flag: boolean;
  dataCount: number;
  from: number;
  to: number;
  current_page: number;
  last_page: number;
}

export interface HotelBookingFilters {
  from_date?: string;
  to_date?: string;
  booking_id_or_pnr?: string;
  api_id?: string;
  staff_id?: string;
  status?: string;
  page?: number;
  per_page?: number;
  platform_type?: string;
  agent_sl_or_name?: string;
}