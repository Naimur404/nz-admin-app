export interface FlightBookingDetails {
  Warnings: any[];
  TicketInfoes: TicketInfo[];
  FlightInfo: FlightInfo;
  PNR: string;
  airline_pnrs: string;
  BookingRefNumber: string;
  BookingStatus: string;
  TicketStatus: string;
  PaymentStatus: string;
  SupportStatus: string;
  AgentRequestStatus: string | null;
  Brand: string;
  OfflineBrand: string | null;
  ApiCorlorCode: string;
  BookingID: number;
  CostingEntryStatus: number;
  ActualCosting_is_Enabled: number;
  BookingCommission: number;
  BookingCommissionType: string;
  CurrencyConversion: CurrencyConversion;
  ChargeAmount: string | null;
  ChargeType: string | null;
  ReceiptPath: string | null;
  Message: string;
  ItemCodeRef: string;
  PriceCodeRef: string;
  BookingCodeRef: string;
  BookingTransactionRef: string;
  Refundable: boolean;
  Bookable: boolean;
  BookingTime: string;
  IssueTime: string;
  currency: string;
  market_id: number;
  is_enable_recept_upload: boolean;
  lastTicketingTime: string;
  agent_info: AgentInfo;
  sub_agent_info: string;
  SearchInfo: SearchInfo;
}

export interface TicketInfo {
  PassengerInfo: PassengerInfo;
  TicketNumbers: string[];
}

export interface PassengerInfo {
  NameElement: NameElement;
  ContactInfo: ContactInfo;
  DocumentInfo: DocumentInfo;
  PassengerType: string;
  Gender: string;
  DateOfBirth: string;
  PassengerKey: number;
  ApiPaxKey: number;
  RefundStatus: string | null;
  ExtraService: ExtraService;
}

export interface NameElement {
  Title: string;
  FirstName: string;
  LastName: string;
  MiddleName: string;
}

export interface ContactInfo {
  Email: string;
  Phone: string;
  PhoneCountryCode: string;
  CountryCode: string;
  CityName: string;
}

export interface DocumentInfo {
  DocumentType: string;
  DocumentNumber: string;
  ExpireDate: string;
  FrequentFlyerNumber: string;
  IssuingCountry: string;
  Nationality: string;
}

export interface ExtraService {
  Wheelchair: boolean;
}

export interface FlightInfo {
  Directions: FlightDirection[][];
  BookingComponent: BookingComponent;
  TicketPriceComponent: TicketPriceComponent;
  OriginalPriceComponent: OriginalPriceComponent;
  PassengerFares: PassengerFare[];
}

export interface FlightDirection {
  Origin: string;
  OriginName: string;
  Destination: string;
  DestinationName: string;
  PlatingCarrierCode: string;
  PlatingCarrierName: string;
  Stops: string;
  Segments: FlightSegment[];
}

export interface FlightSegment {
  Origin: string;
  OriginName: string;
  Destination: string;
  DestinationName: string;
  Group: string;
  Departure: string;
  Arrival: string;
  Airline: string;
  FlightNumber: string;
  SegmentCodeRef: string;
  SegmentKey: number;
  RefundStatus: string | null;
  Details: SegmentDetail[];
  ServiceClass: string;
  Plane: string[];
  Duration: string[];
  TechStops: number[];
  BookingClass: string;
  BookingCount: string;
  FareBasisCode: string;
  AirlineCode: string;
  Baggage: BaggageInfo[];
}

export interface SegmentDetail {
  Origin: string;
  OriginName: string;
  Destination: string;
  DestinationName: string;
  OriginTerminal: string | null;
  DestinationTerminal: string | null;
  Departure: string;
  Arrival: string;
  FlightTime: string;
  TravelTime: string;
  Equipment: string;
}

export interface BaggageInfo {
  Units: string;
  Amount: number;
  PassengerTypeCode: string;
}

export interface BookingComponent {
  DiscountPrice: string;
  TotalPrice: string;
  BasePrice: string;
  Taxes: string;
  AIT: string;
  ExtraServiceCharge: string;
  ServiceCharge: string;
  FareReference: string;
  AgentAdditionalPrice: string;
  MiscCharge: string;
  MiscChargeType: string | null;
  ReissueCharge: number;
}

export interface TicketPriceComponent {
  BasePrice: string;
  Taxes: string;
  Ait: string;
  ExtraServiceCharge: string;
  ReissueCharge: number;
  AgentAdditionalPrice: string;
  GrossPrice: string;
  TotalPrice: string;
}

export interface OriginalPriceComponent {
  TotalPrice: string;
  BasePrice: string;
  Taxes: string;
}

export interface PassengerFare {
  PassengerType: string;
  PassengerCount: number;
  AIT: string;
  TotalPrice: string;
  BasePrice: string;
  Taxes: string;
  DiscountPrice: string;
  AITEdited: string | null;
  TotalPriceEdited: string | null;
  BasePriceEdited: string | null;
  TaxesEdited: string | null;
  DiscountPriceEdited: string | null;
  AdditionalPriceEdited: string | null;
  EquivalentBasePrice: string;
  ServiceCharge: string;
  CompanyCharge: string | null;
  AirlineFee: string | null;
  ReissueCharge: number;
  TaxesBreakdown: any[];
}

export interface CurrencyConversion {
  currency_conversion_rate: string;
  api_currency: string;
  market_currency: string;
  buying_currency: string;
  api_name: string;
}

export interface AgentInfo {
  agent_name: string;
  Email: string;
  Phone: string;
  PhoneCountryCode: string | null;
}

export interface SearchInfo {
  adults: number;
  childs: number;
  infants: number;
  journeyType: string;
  class: string;
  preferredCarriers: any[];
  childrenAges: any[];
  routes: RouteInfo[];
  isdomestic: number;
}

export interface RouteInfo {
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  departureDate: string;
}

export interface FlightBookingDetailsResponse {
  flag: boolean;
  code: number;
  message: string;
  data: FlightBookingDetails;
}