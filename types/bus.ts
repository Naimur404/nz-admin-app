export interface LeadPassenger {
  booking_info_id: number;
  first_name: string;
  last_name: string;
  passenger_type: string;
  is_lead_passenger: boolean;
  ticket_numbers: string;
}

export interface BusBooking {
  id: number;
  pnr: string;
  booking_ref_number: string;
  unique_trans_id: string;
  booking_status: string;
  status: string;
  ticket_status: string;
  support_type: string;
  payment_status: string;
  total_price_selling: string;
  costing: string;
  currency: string;
  gateway_fee: string;
  remarks_for_payment: string | null;
  receipt_path: string | null;
  pay_amount_from_customer: string;
  payment_method: string;
  branch: string;
  total_passengers: number;
  adult_count: number;
  child_count: number;
  infant_count: number;
  refund_request_status: string | null;
  refund_requested_at: string | null;
  refund_time_limit: string | null;
  ticket_numbers: string;
  operator_name: string;
  bus_type: string;
  boarding_location: string;
  dropping_location: string;
  boarding_time: string;
  dropping_time: string;
  lead_passenger: LeadPassenger;
  agent_name: string;
  agent_sl_no: string;
  partner_name: string;
  api_name: string;
  created_at: string;
  status_date: string;
  ticketing_time_limit: string;
}

export interface BusBookingFilters {
  from_date: string;
  to_date: string;
  booking_id_or_pnr?: string;
  agent_sl_or_name?: string;
  ticket_number?: string;
  status?: string;
  page: number;
  per_page: number;
}

export interface BusBookingResponse {
  success: boolean;
  message: string;
  data: BusBooking[];
  code: number;
  total: number;
  per_page: number;
  last_page: number;
  from: number;
  to: number;
  current_page: number;
}

export interface BookingStatusMap {
  [key: string]: string;
}

export interface BookingStatusResponse {
  code: number;
  data: BookingStatusMap;
}

export interface AgentInfo {
  sl_no: string;
  agent_name: string;
  email: string;
  agent_address: string;
  opening_hour: string;
  contact_number: string;
  flight_info: string;
  logo: string;
}

export interface BoardingPoint {
  location: string;
  time: string;
}

export interface DroppingPoint {
  location: string;
  time: string;
}

export interface Passenger {
  id: number;
  full_name: string;
  title: string;
  first_name: string;
  last_name: string;
  passenger_type: string;
  gender: string;
  date_of_birth: string;
  email: string;
  phone: string;
  seat_number: string;
  ticket_numbers: string;
  ticket_status: string;
  is_lead_passenger: boolean;
}

export interface LeadPassengerDetails {
  full_name: string;
  email: string;
  phone: string;
}

export interface FareBreakdown {
  passenger_type: string;
  passenger_count: number;
  total_price: string;
  base_price: string;
  taxes: string;
  discount_price: string;
}

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
  total: number;
}

export interface BusBookingDetails {
  booking_id: number;
  unique_trans_id: string;
  pnr: string;
  booking_ref_number: string;
  booking_status: string;
  status: string;
  ticket_status: string;
  payment_status: string;
  support_type: string;
  costing: string;
  total_price: string;
  base_price: string;
  gateway_fee: string;
  taxes: string;
  discount_price: string;
  currency: string;
  agent_info: AgentInfo;
  operator_name: string;
  bus_type: string;
  is_sleeper: boolean;
  rating: number;
  boarding_point: BoardingPoint;
  dropping_point: DroppingPoint;
  passengers: Passenger[];
  lead_passenger: LeadPassengerDetails;
  fare_breakdown: FareBreakdown[];
  passenger_counts: PassengerCounts;
  ticketing_time_limit: string;
  ticket_issue_date: string;
  status_date: string;
  created_at: string;
}

export interface BusBookingDetailsResponse {
  success: boolean;
  message: string;
  data: BusBookingDetails;
}
